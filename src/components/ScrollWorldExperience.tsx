"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  SCROLL_WORLD_CONNECTORS,
  SCROLL_WORLD_ENVIRONMENTS,
  SCROLL_WORLD_SCENES,
  type MediaSource,
  type ScrollWorldScene,
} from "@/lib/scrollWorld";
import FloatingWidget from "./FloatingWidget";
import RfqModal from "./RfqModal";

type RuntimeSegment = {
  id: string;
  kind: "scene" | "connector";
  environmentIndex: number;
  environmentId: string;
  toEnvironmentId?: string;
  start: number;
  end: number;
  weight: number;
  poster: string;
  mobilePoster?: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  accent: string;
  assetStatus: "available" | "needs-improvement" | "missing" | "optional";
  target: number;
  current: number;
  loading: boolean;
  ready: boolean;
  failed: boolean;
  objectUrl?: string;
};

type StageWindow = {
  scene: ScrollWorldScene;
  sceneIndex: number;
  environmentId: string;
  start: number;
  end: number;
};

const CROSSFADE_UNITS = 0.16;
const VIEWPORTS_PER_UNIT = 100;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smooth(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function chooseVideoSource(source?: MediaSource) {
  if (typeof document === "undefined" || !source) return undefined;
  const video = document.createElement("video");
  if (source.webm && video.canPlayType("video/webm")) return source.webm;
  return source.mp4;
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 860;
}

function makeSegments() {
  const result: RuntimeSegment[] = [];
  const stageWindows: StageWindow[] = [];
  let cursor = 0;

  SCROLL_WORLD_ENVIRONMENTS.forEach((environment, index) => {
    const segment: RuntimeSegment = {
      id: environment.id,
      kind: "scene",
      environmentIndex: index,
      environmentId: environment.id,
      start: cursor,
      end: cursor + environment.scrollWeight,
      weight: environment.scrollWeight,
      poster: environment.poster,
      mobilePoster: environment.mobilePoster,
      video: environment.video,
      mobileVideo: environment.mobileVideo,
      accent: environment.accent,
      assetStatus: environment.assetStatus,
      target: 0,
      current: 0,
      loading: false,
      ready: false,
      failed: false,
    };
    result.push(segment);

    const sceneGroup = SCROLL_WORLD_SCENES.filter((scene) => scene.scene === environment.id);
    const sceneWeight = sceneGroup.reduce((sum, scene) => sum + scene.scrollWeight, 0) || 1;
    let sceneCursor = segment.start;
    sceneGroup.forEach((scene) => {
      const sceneLength = (scene.scrollWeight / sceneWeight) * environment.scrollWeight;
      stageWindows.push({
        scene,
        sceneIndex: SCROLL_WORLD_SCENES.indexOf(scene),
        environmentId: environment.id,
        start: sceneCursor,
        end: sceneCursor + sceneLength,
      });
      sceneCursor += sceneLength;
    });

    cursor = segment.end;

    const next = SCROLL_WORLD_ENVIRONMENTS[index + 1];
    if (!next) return;

    const connector = SCROLL_WORLD_CONNECTORS.find(
      (item) => item.from === environment.id && item.to === next.id
    );
    if (!connector) return;

    const bridge: RuntimeSegment = {
      id: connector.id,
      kind: "connector",
      environmentIndex: index,
      environmentId: connector.from,
      toEnvironmentId: connector.to,
      start: cursor,
      end: cursor + connector.scrollWeight,
      weight: connector.scrollWeight,
      poster: connector.poster,
      video: connector.video,
      mobileVideo: connector.mobileVideo,
      accent: next.accent,
      assetStatus: connector.assetStatus,
      target: 0,
      current: 0,
      loading: false,
      ready: false,
      failed: false,
    };
    result.push(bridge);
    cursor = bridge.end;
  });

  return { segments: result, stageWindows, totalUnits: cursor };
}

export default function ScrollWorldExperience() {
  const { segments, stageWindows, totalUnits } = useMemo(makeSegments, []);
  const segmentState = useRef(segments);
  const stageWindowState = useRef(stageWindows);
  const sceneEls = useRef<(HTMLDivElement | null)[]>([]);
  const imageEls = useRef<(HTMLImageElement | null)[]>([]);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([]);
  const copyEls = useRef<(HTMLElement | null)[]>([]);
  const foregroundEls = useRef<(HTMLDivElement | null)[]>([]);
  const flowEls = useRef<(HTMLLIElement | null)[][]>([]);
  const chapterRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const pelletHeroRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstImageSettled = useRef(false);
  const reducedMotion = useRef(false);
  const targetProgress = useRef(0);
  const visualProgress = useRef(0);
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);
  const [isRfqOpen, setIsRfqOpen] = useState(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const states = segmentState.current;
    const objectUrls: string[] = [];

    const loadSegment = (index: number) => {
      const segment = states[index];
      if (!segment || segment.loading || segment.ready || segment.failed || reducedMotion.current) return;
      if (segment.assetStatus !== "available") return;
      const source = chooseVideoSource(isMobileViewport() ? segment.mobileVideo || segment.video : segment.video);
      if (!source) return;

      segment.loading = true;
      fetch(source)
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to load ${source}`);
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          segment.objectUrl = url;
          setLoadedUrls((current) => ({ ...current, [segment.id]: url }));
        })
        .catch(() => {
          segment.failed = true;
        })
        .finally(() => {
          segment.loading = false;
        });
    };

    const readScrollTarget = () => {
      const track = trackRef.current;
      if (!track) return;
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      targetProgress.current = clamp01((window.scrollY - track.offsetTop) / maxScroll);
    };

    const applyVisualProgress = (localY: number) => {
      const root = rootRef.current;
      const unit = localY * totalUnits;
      let currentSegment = 0;

      root?.style.setProperty("--visual-progress", localY.toFixed(4));

      states.forEach((segment, index) => {
        if (unit >= segment.start) currentSegment = index;
        const length = segment.end - segment.start;
        const local = clamp01((unit - segment.start) / length);
        segment.target = local;

        const outside =
          unit < segment.start ? segment.start - unit : unit > segment.end ? unit - segment.end : 0;
        const opacity = smooth(1 - outside / CROSSFADE_UNITS);
        const scene = sceneEls.current[index];
        const foreground = foregroundEls.current[segment.environmentIndex];
        const image = imageEls.current[index];

        if (scene) {
          scene.style.opacity = opacity.toFixed(3);
          scene.style.zIndex = index === currentSegment ? "4" : String(1 + Math.round(opacity * 2));
          scene.style.setProperty("--sw-local", local.toFixed(3));
        }
        if (foreground && segment.kind === "scene") {
          foreground.style.opacity = Math.min(1, opacity * 1.15).toFixed(3);
          foreground.style.setProperty("--env-local", local.toFixed(3));
        }
        if (image) {
          const grammar = SCROLL_WORLD_ENVIRONMENTS[segment.environmentIndex]?.id;
          const scaleMap: Record<string, number> = {
            "forest-origin": 0.052,
            "wood-processing": 0.035,
            "dry-biomass": 0.058,
            pelletization: 0.044,
            "white-wood-pellet": 0.066,
            "value-upgrading": 0.048,
            "advanced-bioenergy": -0.025,
          };
          const xMap: Record<string, number> = {
            "forest-origin": -1.8,
            "wood-processing": -3.6,
            "dry-biomass": -1.2,
            pelletization: 3.2,
            "white-wood-pellet": 0.4,
            "value-upgrading": 1.3,
            "advanced-bioenergy": 0.2,
          };
          const yMap: Record<string, number> = {
            "forest-origin": 1.1,
            "wood-processing": 0.2,
            "dry-biomass": -0.7,
            pelletization: 0,
            "white-wood-pellet": -0.2,
            "value-upgrading": -0.4,
            "advanced-bioenergy": -2.8,
          };
          const connectorDrift = segment.kind === "connector" ? 1.4 : 0;
          const scale = reducedMotion.current ? 1.02 : 1 + (scaleMap[grammar] ?? 0.04) * local;
          image.style.transform = `translate3d(${((xMap[grammar] ?? 0) * local + connectorDrift * local).toFixed(2)}vw, ${((yMap[grammar] ?? 0) * local).toFixed(2)}vh, 0) scale(${scale.toFixed(3)})`;
        }
      });

      const current = states[currentSegment];
      const stageWindow =
        stageWindowState.current.find((stage) => unit >= stage.start && unit <= stage.end) ||
        stageWindowState.current.reduce((nearest, stage) => {
          const nearestDistance = Math.min(Math.abs(unit - nearest.start), Math.abs(unit - nearest.end));
          const distance = Math.min(Math.abs(unit - stage.start), Math.abs(unit - stage.end));
          return distance < nearestDistance ? stage : nearest;
        }, stageWindowState.current[0]);
      const connectorStage = (() => {
        if (current.kind !== "connector") return stageWindow.sceneIndex;
        const environmentId = current.target > 0.5 ? current.toEnvironmentId : current.environmentId;
        const environment = SCROLL_WORLD_ENVIRONMENTS.find((item) => item.id === environmentId);
        const targetStage =
          SCROLL_WORLD_SCENES.find((scene) => scene.id === environment?.firstStage) ||
          SCROLL_WORLD_SCENES.find((scene) => scene.scene === environmentId);
        return targetStage ? SCROLL_WORLD_SCENES.indexOf(targetStage) : stageWindow.sceneIndex;
      })();
      const stageIndex = connectorStage;

      const mobile = isMobileViewport();
      copyEls.current.forEach((copy, index) => {
        const window = stageWindowState.current[index];
        if (!copy || !window) return;
        const scene = SCROLL_WORLD_SCENES[index];
        const sceneProgress = clamp01((unit - window.start) / (window.end - window.start));
        const visible = unit >= window.start && unit <= window.end;
        const alpha =
          index === 0
            ? visible
              ? smooth(1 - sceneProgress / 0.88)
              : 0
            : index === SCROLL_WORLD_SCENES.length - 1
              ? visible
                ? smooth(sceneProgress / 0.38)
                : 0
              : visible
                ? smooth(1 - Math.abs(sceneProgress - 0.5) / 0.5)
                : 0;
        copy.style.opacity = alpha.toFixed(3);
        copy.style.visibility = alpha > 0.02 ? "visible" : "hidden";
        copy.style.setProperty("--stage-progress", sceneProgress.toFixed(3));
        const yShift = ((0.5 - sceneProgress) * 2.2).toFixed(2);
        const x = scene.align === "center" ? "-50%" : "0";
        const yBase = mobile ? "0px" : "-50%";
        copy.style.transform = reducedMotion.current
          ? `translate3d(${x}, ${yBase}, 0)`
          : `translate3d(${x}, calc(${yBase} + ${yShift}vh), 0)`;

        const flow = flowEls.current[index] || [];
        flow.forEach((item, itemIndex) => {
          if (!item) return;
          const flowProgress = smooth((sceneProgress - itemIndex * 0.16) / 0.28);
          item.style.opacity = String(0.36 + flowProgress * 0.64);
          item.style.transform = `translate3d(0, ${(1 - flowProgress) * 0.5}rem, 0)`;
          item.classList.toggle("active", flowProgress > 0.78);
        });
      });

      const whiteWindow = stageWindowState.current.find((stage) => stage.scene.id === "white-wood-pellet");
      const valueWindow = stageWindowState.current.find((stage) => stage.scene.id === "thermal-upgrading");
      const chapterStart = whiteWindow ? whiteWindow.end - 0.18 : 0;
      const chapterEnd = valueWindow ? valueWindow.start + 0.42 : chapterStart + 0.8;
      const chapterProgress = clamp01((unit - chapterStart) / Math.max(0.1, chapterEnd - chapterStart));
      const chapterAlpha = smooth(chapterProgress / 0.38) * (1 - smooth((chapterProgress - 0.72) / 0.28));
      if (chapterRef.current) {
        chapterRef.current.style.opacity = chapterAlpha.toFixed(3);
        chapterRef.current.style.visibility = chapterAlpha > 0.02 ? "visible" : "hidden";
        chapterRef.current.style.setProperty("--chapter-progress", chapterProgress.toFixed(3));
      }
      // As the second act opens, the interface goes quiet.
      root?.style.setProperty("--ui-quiet", chapterAlpha.toFixed(3));

      const valueSegment = states.find((segment) => segment.id === "value-upgrading");
      const valueProgress = valueSegment
        ? clamp01((unit - valueSegment.start) / (valueSegment.end - valueSegment.start))
        : 0;
      if (valueRef.current) {
        const whiteOpacity = 1 - smooth((valueProgress - 0.18) / 0.28);
        const brownOpacity = smooth((valueProgress - 0.16) / 0.24) * (1 - smooth((valueProgress - 0.56) / 0.24));
        const blackOpacity = smooth((valueProgress - 0.52) / 0.28);
        valueRef.current.style.opacity = valueProgress > 0 && valueProgress < 1 ? "1" : "0";
        valueRef.current.style.setProperty("--value-progress", valueProgress.toFixed(3));
        valueRef.current.style.setProperty("--white-opacity", whiteOpacity.toFixed(3));
        valueRef.current.style.setProperty("--brown-opacity", brownOpacity.toFixed(3));
        valueRef.current.style.setProperty("--black-opacity", blackOpacity.toFixed(3));
      }

      const whiteHeroWindow = stageWindowState.current.find(
        (stage) => stage.scene.id === "white-wood-pellet"
      );
      if (pelletHeroRef.current && whiteHeroWindow) {
        const heroP = clamp01(
          (unit - whiteHeroWindow.start) / (whiteHeroWindow.end - whiteHeroWindow.start)
        );
        const inWindow = unit >= whiteHeroWindow.start - 0.06 && unit <= whiteHeroWindow.end + 0.06;
        const heroAlpha = inWindow ? smooth(heroP / 0.22) * (1 - smooth((heroP - 0.78) / 0.22)) : 0;
        pelletHeroRef.current.style.opacity = heroAlpha.toFixed(3);
        pelletHeroRef.current.style.visibility = heroAlpha > 0.02 ? "visible" : "hidden";
        pelletHeroRef.current.style.setProperty("--hero-scale", (0.96 + heroP * 0.08).toFixed(3));
      }

      const materialProgress = (() => {
        const currentStage = stageIndex + 1;
        if (currentStage <= 2) return 0;
        if (currentStage === 3) return 0.2;
        if (currentStage === 4) return 0.4;
        if (currentStage === 5 || currentStage === 6) return 0.58;
        if (currentStage <= 8) return 0.78;
        return Math.min(1, 0.78 + valueProgress * 0.22);
      })();
      root?.style.setProperty("--material-progress", materialProgress.toFixed(3));
      root?.style.setProperty("--active-stage-index", String(stageIndex));

      loadSegment(currentSegment - 1);
      loadSegment(currentSegment);
      loadSegment(currentSegment + 1);

      setActiveStage((previous) => (previous === stageIndex ? previous : stageIndex));
      setProgress(localY);
    };

    const onScroll = () => {
      readScrollTarget();
    };

    let raf = 0;
    const render = () => {
      const smoothing = reducedMotion.current ? 1 : isMobileViewport() ? 0.18 : 0.115;
      visualProgress.current += (targetProgress.current - visualProgress.current) * smoothing;
      if (Math.abs(targetProgress.current - visualProgress.current) < 0.0007) {
        visualProgress.current = targetProgress.current;
      }

      applyVisualProgress(visualProgress.current);

      states.forEach((segment, index) => {
        const video = videoEls.current[index];
        if (!video || video.seeking || !Number.isFinite(video.duration)) return;
        const seek = Math.min(video.duration * 0.999, video.duration * segment.target);
        segment.current += (segment.target - segment.current) * (isMobileViewport() ? 0.28 : 0.18);
        const smoothedSeek = Math.min(video.duration * 0.999, video.duration * segment.current);
        const seekEpsilon = isMobileViewport() ? 0.035 : 0.018;
        if (Math.abs(video.currentTime - seek) > 0.12 || Math.abs(video.currentTime - smoothedSeek) > seekEpsilon) {
          video.currentTime = smoothedSeek;
        }
      });

      raf = requestAnimationFrame(render);
    };

    const markReady = window.setTimeout(() => setIsReady(true), 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", readScrollTarget);
    readScrollTarget();
    applyVisualProgress(0);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", readScrollTarget);
      window.clearTimeout(markReady);
      cancelAnimationFrame(raf);
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [totalUnits]);

  const activeScene = SCROLL_WORLD_SCENES[activeStage];

  const jumpToScene = (scene: ScrollWorldScene) => {
    const stage = stageWindowState.current.find((item) => item.scene.id === scene.id);
    const track = trackRef.current;
    if (!stage || !track) return;
    const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
    const target = track.offsetTop + ((stage.start + (stage.end - stage.start) * 0.5) / totalUnits) * maxScroll;
    window.scrollTo({
      top: target,
      behavior: reducedMotion.current ? "auto" : "smooth",
    });
  };

  const jumpToEnvironment = (environmentId: string) => {
    const scene = SCROLL_WORLD_SCENES.find((item) => item.scene === environmentId);
    if (scene) jumpToScene(scene);
  };

  return (
    <>
      <div
        ref={rootRef}
        className={`scroll-world scene-${activeScene.scene} stage-${activeScene.id} ${isReady ? "is-ready" : ""}`}
        style={{ "--sw-accent": activeScene.accent } as CSSProperties}
      >
        <div
          ref={trackRef}
          className="scroll-world-track"
          style={{ height: `${Math.max(920, totalUnits * VIEWPORTS_PER_UNIT)}vh` }}
        />

        <div className="scroll-world-stage" aria-hidden="true">
          {["a", "b"].map((buffer, bufferIndex) => (
            <div key={buffer} className={`scroll-world-media-buffer media-${buffer.toUpperCase()}`}>
              {segmentState.current.map((segment, index) => {
                if (index % 2 !== bufferIndex) return null;
                const poster = isMobileViewport() && segment.mobilePoster ? segment.mobilePoster : segment.poster;
                return (
                  <div
                    key={segment.id}
                    ref={(node) => {
                      sceneEls.current[index] = node;
                    }}
                    className={`scroll-world-scene ${segment.kind} ${segment.environmentId}`}
                  >
                    <img
                      ref={(node) => {
                        imageEls.current[index] = node;
                      }}
                      src={poster}
                      alt=""
                      decoding="async"
                      loading={index < 2 ? "eager" : "lazy"}
                      onLoad={() => {
                        if (!firstImageSettled.current && index === 0) {
                          firstImageSettled.current = true;
                          setIsReady(true);
                        }
                      }}
                    />
                    {loadedUrls[segment.id] && (
                      <video
                        ref={(node) => {
                          videoEls.current[index] = node;
                        }}
                        className="scroll-world-video"
                        src={loadedUrls[segment.id]}
                        muted
                        playsInline
                        preload="auto"
                        onLoadedMetadata={() => {
                          segment.ready = true;
                        }}
                        onSeeked={(event) => {
                          event.currentTarget.parentElement?.classList.add("has-video");
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="scroll-world-foregrounds">
            {SCROLL_WORLD_ENVIRONMENTS.map((environment, index) => (
              <div
                key={environment.id}
                ref={(node) => {
                  foregroundEls.current[index] = node;
                }}
                className={`scroll-world-foreground ${environment.id}`}
              >
                <span className="fg-road" />
                <span className="fg-log fg-log-a" />
                <span className="fg-log fg-log-b" />
                <span className="fg-chip-stream" />
                <span className="fg-belt" />
                <span className="fg-dryer" />
                <span className="fg-press" />
                <span className="fg-pellet-bed" />
                <span className="fg-silo" />
                <span className="fg-reactor" />
                <span className="fg-heat" />
                <span className="fg-port" />
                <span className="fg-vessel" />
              </div>
            ))}
          </div>
          <div ref={pelletHeroRef} className="scroll-world-pellet-hero" aria-hidden="true">
            <span className="sw-heap heap-white" />
          </div>
          <div ref={valueRef} className="scroll-world-value-transform" aria-hidden="true">
            <span className="thermal-heat" />
            <span className="sw-heap heap-white pellet-white" />
            <span className="sw-heap heap-brown pellet-brown" />
            <span className="sw-heap heap-black pellet-black" />
          </div>
          <div className="scroll-world-tint" />
          <div className="scroll-world-glow" />
          <div className="scroll-world-grade" />
          <div className="scroll-world-vignette" />
        </div>

        <div ref={chapterRef} className="scroll-world-chapter-transition" aria-hidden="true">
          <p>Value Upgrading</p>
          <h2>
            <span>More than a transformation.</span>
            <span>A new layer of value.</span>
          </h2>
          <small>The journey continues beyond conventional wood pellets.</small>
          <ol>
            <li>Product</li>
            <li>Technology</li>
            <li>Higher Value</li>
          </ol>
        </div>

        <header className="scroll-world-header">
          <a className="scroll-world-brand" href="#top" aria-label="An Viet Phat Group">
            <img src="/icons/avp-logo-full.png" alt="An Viet Phat" />
          </a>
          <nav className="scroll-world-chapters" aria-label="Major scenes">
            {SCROLL_WORLD_ENVIRONMENTS.map((environment) => (
              <button
                key={environment.id}
                type="button"
                className={activeScene.scene === environment.id ? "active" : ""}
                onClick={() => jumpToEnvironment(environment.id)}
              >
                {environment.label}
              </button>
            ))}
          </nav>
          <button className="scroll-world-cta" type="button" onClick={() => setIsRfqOpen(true)}>
            Request specification
          </button>
        </header>

        <div className="scroll-world-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        <main className="scroll-world-copy-layer">
          {SCROLL_WORLD_SCENES.map((scene, index) => (
            <article
              key={scene.id}
              ref={(node) => {
                copyEls.current[index] = node;
              }}
              className={`scroll-world-copy align-${scene.align} ${scene.emphasis ? "emphasis" : ""}`}
            >
              <p className="scroll-world-kicker">{scene.eyebrow}</p>
              <h1>
                {scene.headline.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              {scene.body && <p className="scroll-world-body">{scene.body}</p>}
              <ol
                className="scroll-world-flow"
                style={{ "--flow-columns": scene.flow.length } as CSSProperties}
                aria-label={`${scene.eyebrow} process flow`}
              >
                {scene.flow.map((step, stepIndex) => (
                  <li
                    key={step}
                    ref={(node) => {
                      flowEls.current[index] ||= [];
                      flowEls.current[index][stepIndex] = node;
                    }}
                  >
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {scene.tags && (
                <ul className="scroll-world-tags">
                  {scene.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
              {scene.data && <p className="scroll-world-data">{scene.data}</p>}
            </article>
          ))}
        </main>

        <nav className="scroll-world-rail" aria-label="Production stages">
          <span className="rail-active-marker" aria-hidden="true" />
          {SCROLL_WORLD_SCENES.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              className={index === activeStage ? "active" : ""}
              onClick={() => jumpToScene(scene)}
              aria-label={scene.eyebrow}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </button>
          ))}
        </nav>

        <div className="scroll-world-loader" aria-hidden="true">
          <span />
          <b>Loading cinematic chain</b>
        </div>
      </div>

      <FloatingWidget onOpenRfq={() => setIsRfqOpen(true)} />
      <RfqModal isOpen={isRfqOpen} onClose={() => setIsRfqOpen(false)} />
      <span className="sr-only">
        {activeStage + 1} / {SCROLL_WORLD_SCENES.length}: {activeScene.eyebrow}
      </span>
    </>
  );
}

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
  const trackRef = useRef<HTMLDivElement>(null);
  const firstImageSettled = useRef(false);
  const reducedMotion = useRef(false);
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

    const update = () => {
      const track = trackRef.current;
      if (!track) return;

      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      const localY = clamp01((window.scrollY - track.offsetTop) / maxScroll);
      const unit = localY * totalUnits;
      let currentSegment = 0;

      states.forEach((segment, index) => {
        if (unit >= segment.start) currentSegment = index;
        const length = segment.end - segment.start;
        const local = clamp01((unit - segment.start) / length);
        segment.target = local;

        const outside =
          unit < segment.start ? segment.start - unit : unit > segment.end ? unit - segment.end : 0;
        const opacity = smooth(1 - outside / CROSSFADE_UNITS);
        const scene = sceneEls.current[index];
        const image = imageEls.current[index];

        if (scene) {
          scene.style.opacity = opacity.toFixed(3);
          scene.style.zIndex = index === currentSegment ? "4" : String(1 + Math.round(opacity * 2));
          scene.style.setProperty("--sw-local", local.toFixed(3));
        }
        if (image) {
          const drift = segment.kind === "connector" ? 2 : segment.environmentIndex % 2 === 0 ? -1.6 : 1.6;
          const scale = reducedMotion.current ? 1.02 : 1.035 + local * 0.08;
          image.style.transform = `translate3d(${(drift * local).toFixed(2)}vw, 0, 0) scale(${scale.toFixed(3)})`;
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
      const stageIndex =
        current.kind === "connector" && current.target > 0.5
          ? Math.min(SCROLL_WORLD_SCENES.length - 1, stageWindow.sceneIndex + 1)
          : stageWindow.sceneIndex;

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
        const copyShift = `translate3d(0, ${((0.5 - sceneProgress) * 2.2).toFixed(2)}vh, 0)`;
        const centerShift = scene.align === "center" ? "translateX(-50%) " : "";
        copy.style.transform = reducedMotion.current ? centerShift || "none" : `${centerShift}${copyShift}`;
      });

      loadSegment(currentSegment);
      loadSegment(currentSegment + 1);

      setActiveStage((previous) => (previous === stageIndex ? previous : stageIndex));
      setProgress(localY);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    const tickVideos = () => {
      states.forEach((segment, index) => {
        const video = videoEls.current[index];
        if (!video || video.seeking || !Number.isFinite(video.duration)) return;
        const seek = Math.min(video.duration * 0.999, video.duration * segment.target);
        segment.current += (segment.target - segment.current) * (isMobileViewport() ? 0.32 : 0.2);
        const smoothedSeek = Math.min(video.duration * 0.999, video.duration * segment.current);
        if (Math.abs(video.currentTime - seek) > 0.08 || Math.abs(video.currentTime - smoothedSeek) > 0.018) {
          video.currentTime = smoothedSeek;
        }
      });
      requestAnimationFrame(tickVideos);
    };

    const markReady = window.setTimeout(() => setIsReady(true), 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    requestAnimationFrame(tickVideos);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.clearTimeout(markReady);
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [totalUnits]);

  const activeScene = SCROLL_WORLD_SCENES[activeStage];
  const activeEnvironment = SCROLL_WORLD_ENVIRONMENTS.find((scene) => scene.id === activeScene.scene);

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
        className={`scroll-world scene-${activeScene.scene} ${isReady ? "is-ready" : ""}`}
        style={{ "--sw-accent": activeScene.accent } as CSSProperties}
      >
        <div
          ref={trackRef}
          className="scroll-world-track"
          style={{ height: `${Math.max(920, totalUnits * VIEWPORTS_PER_UNIT)}vh` }}
        />

        <div className="scroll-world-stage" aria-hidden="true">
          {segmentState.current.map((segment, index) => {
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
          <div className="scroll-world-grade" />
          <div className="scroll-world-vignette" />
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

        <div className="scroll-world-label" aria-hidden="true">
          <span>{activeEnvironment?.sceneLabel}</span>
          <strong>{activeEnvironment?.label}</strong>
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

        <div className="scroll-world-value-mark" aria-hidden="true">
          <span>Value Upgrading</span>
        </div>

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

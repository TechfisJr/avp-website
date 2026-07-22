"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { W } from "./timeline";
import { flags, scroll } from "./scrollStore";

gsap.registerPlugin(ScrollTrigger);

type ExperienceScrollOptions = {
  reducedMotion: boolean;
  track: HTMLElement;
};

type ExperienceScrollController = {
  cleanup: () => void;
};

let lenis: Lenis | null = null;

export function setupExperienceScroll({
  reducedMotion,
  track,
}: ExperienceScrollOptions): ExperienceScrollController {
  flags.reducedMotion = reducedMotion;
  scroll.t = 0;
  scroll.v = 0;

  let tickLenis: ((time: number) => void) | null = null;
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, syncTouch: true });
    lenis.on("scroll", ScrollTrigger.update);
    tickLenis = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
  } else {
    lenis = null;
  }

  const trigger = ScrollTrigger.create({
    trigger: track,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      scroll.t = self.progress;
      scroll.v = self.getVelocity() / 4000;
    },
  });

  ScrollTrigger.refresh();

  return {
    cleanup: () => {
      trigger.kill();
      if (tickLenis) gsap.ticker.remove(tickLenis);
      lenis?.destroy();
      lenis = null;
    },
  };
}

export function scrollToStation(index: number) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const target = (index + 0.3) * W * maxScroll;
  if (lenis && !flags.reducedMotion) {
    lenis.scrollTo(target, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: target, behavior: flags.reducedMotion ? "auto" : "smooth" });
}

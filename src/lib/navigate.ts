import { flags, smoothScroll } from "./scrollStore";
import { W } from "./timeline";

export const TRACK_ID = "cinematic-track";
export const CONTACT_ID = "contact";

/**
 * Progress at which station i's copy is fully revealed and the camera is
 * mid-dwell. overlayAlpha() peaks between local 0.34 and 0.72, so 0.45 lands
 * comfortably inside the hold rather than on a transition.
 */
export function stationProgress(i: number): number {
  return (i + 0.45) * W;
}

/** Absolute document offset (px) of a progress value on the cinematic track. */
export function progressToOffset(t: number): number {
  const track = document.getElementById(TRACK_ID);
  if (!track) return 0;
  // ScrollTrigger maps [track top → viewport top] to [track bottom → viewport
  // bottom], so the scrubbed distance is the track height minus one viewport.
  const top = track.getBoundingClientRect().top + window.scrollY;
  const span = Math.max(1, track.offsetHeight - window.innerHeight);
  return top + t * span;
}

function goTo(offset: number) {
  const lenis = smoothScroll.instance;
  if (lenis && !flags.reducedMotion) {
    lenis.scrollTo(offset, { duration: 1.5 });
  } else {
    window.scrollTo({
      top: offset,
      behavior: flags.reducedMotion ? "auto" : "smooth",
    });
  }
}

export function scrollToStation(i: number) {
  goTo(progressToOffset(stationProgress(i)));
}

export function scrollToContact() {
  const el = document.getElementById(CONTACT_ID);
  if (!el) return;
  goTo(el.getBoundingClientRect().top + window.scrollY);
}

export function navigateTo(target: number | "contact") {
  if (target === "contact") scrollToContact();
  else scrollToStation(target);
}

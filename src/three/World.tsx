"use client";

import Studio from "./Studio";
import Backdrop from "./Backdrop";
import MachineKit from "./MachineKit";
import Rig from "./Rig";
import HeroPellets from "./scenes/HeroPellets";
import Collection from "./scenes/Collection";
import Drying from "./scenes/Drying";
import Pelletizing from "./scenes/Pelletizing";
import Export from "./scenes/Export";
import Earth from "./scenes/Earth";
import Motes from "./fx/Motes";
import type { Quality } from "@/lib/quality";

/**
 * Everything inside the scroll context: the camera rig, studio lighting, all
 * seven story scenes (each self-culling to its scroll window), atmospheric
 * motes, and a soft airy fog whose colour matches the page background so the
 * far edge of every scene fades away invisibly.
 */
export default function World({ quality }: { quality: Quality }) {
  return (
    <>
      <fog attach="fog" args={["#0c0e09", 14, 88]} />
      <Rig />
      <Backdrop />
      <Studio />
      <MachineKit />

      <HeroPellets count={quality.pelletCount} />
      {/* Scene 2 (forest) is a full-frame video layer — see ForestVideo */}
      <Collection />
      <Drying />
      <Pelletizing />
      <Export />
      <Earth />

      {quality.motes > 0 && <Motes count={quality.motes} />}
    </>
  );
}

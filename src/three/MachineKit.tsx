"use client";

import { useLayoutEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { metalMat, steelDarkMat, paintMat, floorMat } from "./materials/kit";

/**
 * Surfaces the shared machine materials with real CC0 PBR textures so the
 * factory reads as worn steel + painted panels on a concrete floor rather than
 * flat plastic. Assigns the maps onto the singleton materials once (every scene
 * that imports them upgrades at the same time). ARM maps pack AO(R) / rough(G) /
 * metal(B), which three reads from the roughness/metalness map channels.
 */
export default function MachineKit() {
  const t = useTexture([
    "/textures/metal_plate/metal_plate_diff_1k.jpg",
    "/textures/metal_plate/metal_plate_nor_gl_1k.jpg",
    "/textures/metal_plate/metal_plate_arm_1k.jpg",
    "/textures/metal_plate_02/metal_plate_02_diff_1k.jpg",
    "/textures/metal_plate_02/metal_plate_02_nor_gl_1k.jpg",
    "/textures/metal_plate_02/metal_plate_02_arm_1k.jpg",
    "/textures/concrete_floor_worn_02/concrete_floor_worn_02_diff_1k.jpg",
    "/textures/concrete_floor_worn_02/concrete_floor_worn_02_nor_gl_1k.jpg",
    "/textures/concrete_floor_worn_02/concrete_floor_worn_02_rough_1k.jpg",
  ]);

  useLayoutEffect(() => {
    const [mD, mN, mA, pD, pN, pA, cD, cN, cR] = t;
    const prep = (tex: THREE.Texture, srgb: boolean, repeat: number) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat, repeat);
      tex.anisotropy = 8;
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    };

    // steel plate — shared by the bright metal and the dark steel frames
    [mD, mN, mA].forEach((x, i) => prep(x, i === 0, 2));
    for (const [mat, tint] of [
      [metalMat, "#dfe4e8"],
      [steelDarkMat, "#8b939b"],
    ] as const) {
      mat.map = mD;
      mat.normalMap = mN;
      mat.roughnessMap = mA;
      mat.metalnessMap = mA;
      mat.metalness = 1;
      mat.roughness = 1;
      mat.color.set(tint);
      mat.needsUpdate = true;
    }

    // painted machine panels — same detail, read as painted (low metalness)
    [pD, pN, pA].forEach((x, i) => prep(x, i === 0, 2));
    paintMat.map = pD;
    paintMat.normalMap = pN;
    paintMat.roughnessMap = pA;
    paintMat.metalnessMap = pA;
    paintMat.metalness = 0.25;
    paintMat.roughness = 1;
    paintMat.color.set("#e7ebe4");
    paintMat.needsUpdate = true;

    // worn concrete floor
    [cD, cN, cR].forEach((x, i) => prep(x, i === 0, 12));
    floorMat.map = cD;
    floorMat.normalMap = cN;
    floorMat.roughnessMap = cR;
    floorMat.roughness = 1;
    floorMat.metalness = 0;
    floorMat.color.set("#cfcabf");
    floorMat.needsUpdate = true;
  }, [t]);

  return null;
}

import * as THREE from "three";

export function isVisibleInTree(object: THREE.Object3D | null | undefined) {
  let node: THREE.Object3D | null | undefined = object;
  while (node) {
    if (!node.visible) return false;
    node = node.parent;
  }
  return true;
}

import {
  Box3,
  DepthTexture,
  DoubleSide,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  UnsignedIntType,
  Vector3,
  WebGLRenderTarget,
} from "three";
import { scene } from "../core/scene";
import { screenLightUniforms } from "./screen-light";

import type { Object3D, WebGLRenderer } from "three";

// Shadow maps for the lights-off look (sampled in screen-light.glsl):
//  - one wide perspective map per monitor, from just in front of the glass, for the direct screen light;
//  - one top-down orthographic map over the room, so the soft overhead bounce light is blocked by whatever is
//    above a surface (the desk top keeps it off the floor underneath).
// Following three's own shadow practice, a small normal offset plus a depth bias avoid self-shadowing (acne).

export const SHADOW_SIZE = 2048;
export const SHADOW_NEAR = 0.06;
export const SHADOW_FAR = 9;
const FOV = 140;
const UP_SIZE = 1024;
const UP_HEIGHT = 12; // camera height above the room top; keep in sync with SL_UP_* in screen-light.glsl

const makeTarget = (size: number) =>
  new WebGLRenderTarget(size, size, { depthTexture: new DepthTexture(size, size, UnsignedIntType), depthBuffer: true });

const cameras = [0, 1].map(() => new PerspectiveCamera(FOV, 1, SHADOW_NEAR, SHADOW_FAR));
const targets = [0, 1].map(() => makeTarget(SHADOW_SIZE));
const upCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
const upTarget = makeTarget(UP_SIZE);

// Depth only: colour writes are off, both faces count so thin parts (chair, monitor arms) still occlude.
const depthMaterial = new MeshBasicMaterial({ colorWrite: false, side: DoubleSide });

screenLightUniforms.uShadowMap0.value = targets[0]!.depthTexture;
screenLightUniforms.uShadowMap1.value = targets[1]!.depthTexture;
screenLightUniforms.uUpShadowMap.value = upTarget.depthTexture;

const target = new Vector3();
const offset = new Vector3();
const bounds = new Box3();
const center = new Vector3();
const size = new Vector3();
let room: Object3D | null = null;

/** The hero room group, whose bounds the top-down map covers. */
const setRoom = (group: Object3D) => {
  room = group;
};

const placeScreenCamera = (i: number) => {
  const cam = cameras[i]!;
  const pos = screenLightUniforms.uScreenPos.value[i]!;
  const n = screenLightUniforms.uScreenNormal.value[i]!;
  const up = screenLightUniforms.uScreenUp.value[i]!;
  // Just in front of the glass, so the monitor body behind it falls outside the near plane.
  cam.position.copy(pos).add(offset.copy(n).multiplyScalar(0.05));
  cam.up.copy(up).normalize();
  cam.lookAt(target.copy(cam.position).add(n));
  cam.updateMatrixWorld();
  screenLightUniforms.uShadowMatrix.value[i]!.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
};

const placeUpCamera = () => {
  if (!room) return false;
  bounds.setFromObject(room);
  if (bounds.isEmpty()) return false;
  bounds.getCenter(center);
  bounds.getSize(size);
  const half = Math.max(size.x, size.z) / 2 + 0.2;
  upCamera.left = -half;
  upCamera.right = half;
  upCamera.top = half;
  upCamera.bottom = -half;
  upCamera.near = 0.1;
  upCamera.far = UP_HEIGHT + size.y + 1;
  upCamera.position.set(center.x, bounds.max.y + UP_HEIGHT, center.z);
  upCamera.up.set(0, 0, -1);
  upCamera.lookAt(center.x, bounds.min.y, center.z);
  upCamera.updateProjectionMatrix();
  upCamera.updateMatrixWorld();
  screenLightUniforms.uUpShadowMatrix.value.multiplyMatrices(upCamera.projectionMatrix, upCamera.matrixWorldInverse);
  screenLightUniforms.uUpNearFar.value.set(upCamera.near, upCamera.far);
  return true;
};

/** Renders the shadow maps. Call right before the main render; it does nothing while the lights are on. */
const update = (renderer: WebGLRenderer) => {
  if (screenLightUniforms.uLightsOff.value <= 0) return;

  const prevTarget = renderer.getRenderTarget();
  const prevOverride = scene.instance.overrideMaterial;
  const prevAutoClear = renderer.autoClear;
  renderer.autoClear = true;
  scene.instance.overrideMaterial = depthMaterial;

  for (let i = 0; i < 2; i++) {
    placeScreenCamera(i);
    renderer.setRenderTarget(targets[i]!);
    renderer.clear(true, true, false);
    renderer.render(scene.instance, cameras[i]!);
  }

  if (placeUpCamera()) {
    renderer.setRenderTarget(upTarget);
    renderer.clear(true, true, false);
    renderer.render(scene.instance, upCamera);
  }

  scene.instance.overrideMaterial = prevOverride;
  renderer.setRenderTarget(prevTarget);
  renderer.autoClear = prevAutoClear;
};

const destroy = () => {
  targets.forEach((t) => t.dispose());
  upTarget.dispose();
  depthMaterial.dispose();
  room = null;
};

export const screenShadows = { update, destroy, setRoom };

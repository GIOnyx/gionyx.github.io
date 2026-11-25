import { Box3, BoxGeometry, Group, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Vector3 } from "three";
import gsap from "gsap";
import { watch, type WatchStopHandle } from "vue";
import { resources } from "../../../utils/resources";
import { raycast } from "../../utils/raycast";
import { lightsOff, toggleLights } from "../../../composables/useLights";
import { sceneWeights } from "../../../animations/scenes";
import { withScreenLight } from "../../common/screen-light";
import { room } from ".";

import type { ClickableBox3 } from "../../types";

// A wall-mounted rocker light switch on the back wall, between the corkboard and the photo frame.
// Coordinates are in the room group's space: the back wall is the plane x ≈ -2.69 (where the frame and
// corkboard hang), facing +x toward the camera. Clicking it toggles the lights-off look (see screen-light.ts).

const WALL_X = -2.69;
const PLATE_DEPTH = 0.025;
// Vertically centred on the photo frame (frame spans y 2.67–3.86).
const SWITCH_POSITION = new Vector3(WALL_X + PLATE_DEPTH / 2, 3.265, -1.78);
const ROCKER_TILT = 0.3;

let group: Group | null = null;
let rocker: Group | null = null;
let box3: ClickableBox3 | null = null;
let stopWatch: WatchStopHandle | null = null;
const geometries: BoxGeometry[] = [];
const materials: (MeshMatcapMaterial | MeshBasicMaterial)[] = [];

const matcap = (color: number) => {
  const texture = resources.items["matcap-white"];
  texture.colorSpace = LinearSRGBColorSpace;
  const m = withScreenLight(new MeshMatcapMaterial({ matcap: texture, color }));
  materials.push(m);
  return m;
};

const box = (x: number, y: number, z: number) => {
  const g = new BoxGeometry(x, y, z);
  geometries.push(g);
  return g;
};

const init = () => {
  if (group) return;
  group = new Group();
  group.position.copy(SWITCH_POSITION);

  // Wall plate (thin along x), a recessed bezel, and the rocker on a hinge.
  const plate = new Mesh(box(PLATE_DEPTH, 0.3, 0.2), matcap(0xf6efe3));
  const bezel = new Mesh(box(0.01, 0.17, 0.09), matcap(0xd9ccb6));
  bezel.position.x = PLATE_DEPTH / 2 + 0.004;

  rocker = new Group();
  rocker.position.x = PLATE_DEPTH / 2 + 0.008;
  const paddle = new Mesh(box(0.022, 0.15, 0.075), matcap(0xfffaf2));
  paddle.position.x = 0.01;
  // Locator light: unlit, so it glows warm when the room is dark and you can still find the switch.
  const pipMaterial = new MeshBasicMaterial({ color: 0xff9a2e });
  materials.push(pipMaterial);
  const pip = new Mesh(box(0.01, 0.04, 0.036), pipMaterial);
  pip.position.set(0.023, 0.045, 0);
  rocker.add(paddle, pip);

  group.add(plate, bezel, rocker);
  room.group.add(group);

  setRocker(lightsOff.value, true);
  stopWatch = watch(lightsOff, (off) => setRocker(off, false));

  box3 = new Box3();
  updateHitBox();
  box3.onClick = () => {
    if (sceneWeights.hero < 0.95) return;
    toggleLights();
  };
  box3.hoverSound = "hover";
  raycast.boxesToCheck.push(box3);

  gsap.ticker.add(tick);
};

// The click box must be in world space, so it is refreshed from the group's current world matrix.
const updateHitBox = () => {
  if (!group || !box3) return;
  group.updateWorldMatrix(true, true);
  box3.setFromObject(group);
  box3.expandByScalar(0.06);
};

/** Rocker up = lights on, down = off. */
const setRocker = (off: boolean, instant: boolean) => {
  if (!rocker) return;
  const z = off ? -ROCKER_TILT : ROCKER_TILT;
  if (instant) rocker.rotation.z = z;
  else gsap.to(rocker.rotation, { z, duration: 0.16, ease: "back.out(3)" });
};

const tick = () => {
  if (!group || sceneWeights.hero < 0.001) return;
  updateHitBox();
};

const destroy = () => {
  gsap.ticker.remove(tick);
  stopWatch?.();
  stopWatch = null;
  if (box3) raycast.boxesToCheck.splice(raycast.boxesToCheck.indexOf(box3), 1);
  box3 = null;
  if (group) room.group.remove(group);
  group = null;
  rocker = null;
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  geometries.length = 0;
  materials.length = 0;
};

export const lightSwitch = { init, destroy };

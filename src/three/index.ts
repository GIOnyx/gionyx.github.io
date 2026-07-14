import { camera } from "./core/camera";
import { renderer } from "./core/renderer";
import { objects } from "./objects";
import { renderTarget } from "./core/renderTarget";
import { threeSizes } from "./utils/sizes";
import { resources } from "../utils/resources";
import { raycast } from "./utils/raycast";
import { animations } from "../animations";
import { room } from "./objects/room";
import { avatar } from "./objects/avatar";
import { lab } from "./objects/lab";

let canvas: HTMLCanvasElement | null = null;

const updateLayout = () => {
  const isLandscape = threeSizes.width > threeSizes.height;

  // Ensure character sits in the chair (desktop-idle is sitting, t-idle is standing)
  avatar.tIdleIntensity.value = 0;

  // Hide the lab pod base (blue circle on rug)
  lab.group.visible = false;

  if (isLandscape) {
    // Landscape initial layout setup
    room.group.position.set(2, 0, 0);
    room.group.rotation.set(0, -2.3, 0);

    avatar.waypointsPosition.set(2, 0, 0);
    avatar.waypointsRotation.set(0, -2.3 + Math.PI / 2, 0);
  } else {
    // Portrait initial layout setup
    room.group.position.set(0, 0, 0);
    room.group.rotation.set(0, -2.1, 0);

    avatar.waypointsPosition.set(0, 0, 0);
    avatar.waypointsRotation.set(0, -2.1 + Math.PI / 2, 0);
  }
};

let isInitializing = false;

const init = (_canvas: HTMLCanvasElement) => {
  if (isInitializing) return;
  isInitializing = true;
  canvas = _canvas;

  const start = () => {
    threeSizes.init(_canvas);
    camera.init();
    renderTarget.init();
    renderer.init(canvas!);

    objects.init();
    raycast.init();
    animations.init();

    // Align layout and register window resize update listener
    updateLayout();
    threeSizes.on("resize", updateLayout);
  };

  if (resources.isReady) {
    start();
  } else {
    resources.once("ready", start);
  }
};

const destroy = () => {
  isInitializing = false;
  threeSizes.off("resize", updateLayout);
  threeSizes.destroy();
  renderTarget.destroy();
  renderer.destroy();
  objects.destroy();
  camera.destroy();
  canvas = null;
};

export const three = { init, destroy };

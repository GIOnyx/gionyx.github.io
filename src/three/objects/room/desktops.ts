import { resources } from "../../../utils/resources";
import { BufferAttribute, LinearSRGBColorSpace, Mesh, RepeatWrapping, ShaderMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { room } from ".";
import fragmentShader from "../../shaders/desktops/fragment.glsl";
import vertexShader from "../../shaders/desktops/vertex.glsl";
import gsap from "gsap";
import { sceneWeights } from "../../../animations/scenes";
import { animations as avatarAnimations } from "../avatar/animations";
import { leftDesktop as avatarLeftDesktop } from "../avatar/left-desktop";
import { playSound } from "../../../features/sounds/utils/sounds";

import type { Object3D, Material, BufferGeometry } from "three";

let mesh: Mesh | null = null;
let material: Material | null = null;
let geometry: BufferGeometry | null = null;

let messageTween: gsap.core.Tween | null = null;
let scrollInterval: gsap.core.Tween | null = null;

const uniforms = {
  uScrollDepth: { value: 0 },
  uMessageIntensity: { value: 0 },
};

const init = () => {
  setupMesh();
  startScrollInterval();
};

const setupMesh = () => {
  const resource = resources.items["room-model"];

  const desktop1 = resource.scene.children.find((child: Object3D) => child.name === "desktop-plane-0");
  const desktop2 = resource.scene.children.find((child: Object3D) => child.name === "desktop-plane-1");

  const geom1 = desktop1.geometry.clone();
  const geom2 = desktop2.geometry.clone();

  geom1.translate(desktop1.position.x, desktop1.position.y, desktop1.position.z);
  geom2.translate(desktop2.position.x, desktop2.position.y, desktop2.position.z);

  // Add scrollIntensity attribute to geometries
  const scrollIntensity1 = new Float32Array(geom1.attributes.position.count).fill(1);
  const scrollIntensity2 = new Float32Array(geom2.attributes.position.count).fill(0);
  geom1.setAttribute("scrollIntensity", new BufferAttribute(scrollIntensity1, 1));
  geom2.setAttribute("scrollIntensity", new BufferAttribute(scrollIntensity2, 1));

  // add messageIntensity attribute to geometries
  const messageIntensity1 = new Float32Array(geom1.attributes.position.count).fill(0);
  const messageIntensity2 = new Float32Array(geom2.attributes.position.count).fill(1);
  geom1.setAttribute("messageIntensity", new BufferAttribute(messageIntensity1, 1));
  geom2.setAttribute("messageIntensity", new BufferAttribute(messageIntensity2, 1));

  geometry = mergeGeometries([geom1, geom2]);

  const texture = resources.items["desktops-texture"];
  texture.colorSpace = LinearSRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  material = new ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      uTexture: { value: texture },
      ...uniforms,
    },
  });

  mesh = new Mesh(geometry, material);

  room.group.add(mesh);
};

const startScrollInterval = () => {
  if (scrollInterval) scrollInterval.kill();

  scrollInterval = gsap.delayedCall(Math.random() * 2 + 3, () => {
    startScrollInterval();

    if (sceneWeights.hero < 0.95) return;

    const idleAction = avatarAnimations.actions.get("desktop-idle");
    if (!idleAction || idleAction.weight < 0.95) return;

    const isAtLeftDesktop = avatarLeftDesktop.getIsActive();
    if (isAtLeftDesktop) return;

    scroll();

    //double scroll
    if (Math.random() <= 0.33) {
      gsap.delayedCall(0.6, () => {
        if (sceneWeights.hero < 0.2) return;
        if (!idleAction || idleAction.weight < 0.95) return;
        scroll();
      });
    }
  });
};

const scroll = () => {
  const scrollDepth = Math.random() * (-0.25 - 0.25) + 0.25;

  gsap.to(uniforms.uScrollDepth, { value: scrollDepth, duration: 1 });

  playSound("mouseWheel");
};

const showMessage = () => {
  if (messageTween) messageTween.kill();
  messageTween = gsap.fromTo(uniforms.uMessageIntensity, { value: 1 }, { value: 0, duration: 1, delay: 2 });
};

const destroy = () => {
  material?.dispose();
  material = null;
  geometry?.dispose();
  geometry = null;
  mesh = null;
  scrollInterval?.kill();
  scrollInterval = null;
  messageTween?.kill();
  messageTween = null;
};

export const desktops = { init, destroy, scroll, showMessage };

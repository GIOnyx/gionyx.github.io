import { Color, Matrix4, SRGBColorSpace, Vector2, Vector3 } from "three";
import type { Texture } from "three";
import gsap from "gsap";
import { watch, type WatchStopHandle } from "vue";
import { lightsOff } from "../../composables/useLights";
import { sceneWeights } from "../../animations/scenes";
import screenLightGlsl from "../shaders/includes/screen-light.glsl";

import type { Material, WebGLProgramParametersWithUniforms } from "three";
import type { ScreenLight } from "../objects/room/desktops";

// Shared uniforms for the lights-off look. Every lit material spreads these, so one update drives them all.
export const screenLightUniforms = {
  uLightsOff: { value: 0 },
  uScreenPos: { value: [new Vector3(), new Vector3()] },
  uScreenNormal: { value: [new Vector3(0, 0, 1), new Vector3(0, 0, 1)] },
  uScreenRight: { value: [new Vector3(), new Vector3()] },
  uScreenUp: { value: [new Vector3(), new Vector3()] },
  // Filled by screen-shadows.ts
  uShadowMap0: { value: null as Texture | null },
  uShadowMap1: { value: null as Texture | null },
  uShadowMatrix: { value: [new Matrix4(), new Matrix4()] },
  uUpShadowMap: { value: null as Texture | null },
  uUpShadowMatrix: { value: new Matrix4() },
  uUpNearFar: { value: new Vector2(0.1, 20) },
};

// Matches SL_AMBIENT in screen-light.glsl, so the empty background darkens exactly like the room.
const AMBIENT = new Color(0.011, 0.013, 0.026);

const fade = { value: lightsOff.value ? 1 : 0 };
let stopWatch: WatchStopHandle | null = null;
let screens: ScreenLight[] = [];
let spaceMatrix: Matrix4 | null = null;

const init = (_screens: ScreenLight[], _spaceMatrix: Matrix4) => {
  screens = _screens;
  spaceMatrix = _spaceMatrix;
  stopWatch?.();
  stopWatch = watch(lightsOff, (off) => {
    gsap.to(fade, { value: off ? 1 : 0, duration: off ? 0.45 : 0.7, ease: off ? "power2.out" : "power2.inOut", overwrite: true });
  });
  gsap.ticker.add(tick);
};

const tick = () => {
  // Only the hero room is lit by the screens; other scenes keep their normal look.
  screenLightUniforms.uLightsOff.value = fade.value * sceneWeights.hero;
  if (!spaceMatrix || screenLightUniforms.uLightsOff.value <= 0) return;

  screens.forEach((s, i) => {
    screenLightUniforms.uScreenPos.value[i]!.copy(s.center).applyMatrix4(spaceMatrix!);
    screenLightUniforms.uScreenNormal.value[i]!.copy(s.normal).transformDirection(spaceMatrix!);
    // Half extents keep their length, so transform as vectors without normalising.
    screenLightUniforms.uScreenRight.value[i]!.copy(s.right).applyMatrix4(spaceMatrix!).sub(tmpOrigin.setFromMatrixPosition(spaceMatrix!));
    screenLightUniforms.uScreenUp.value[i]!.copy(s.up).applyMatrix4(spaceMatrix!).sub(tmpOrigin.setFromMatrixPosition(spaceMatrix!));
  });
};
const tmpOrigin = new Vector3();

/** Adds lights-off shading to a built-in material (MeshBasicMaterial, MeshMatcapMaterial). */
export const withScreenLight = <T extends Material>(material: T): T => {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, screenLightUniforms);
    shader.vertexShader =
      "varying vec3 vSLWorldPos;\n" +
      shader.vertexShader.replace(
        "#include <project_vertex>",
        "#include <project_vertex>\n  vSLWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader =
      "varying vec3 vSLWorldPos;\n" +
      screenLightGlsl +
      "\n" +
      shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        "outgoingLight = applyScreenLight(outgoingLight, vSLWorldPos, slFlatNormal(vSLWorldPos));\n  #include <opaque_fragment>",
      );
  };
  material.customProgramCacheKey = () => "screen-light";
  return material;
};

const clear = new Color();
const darkTarget = new Color();
const ambientSRGB = [AMBIENT.r, AMBIENT.g, AMBIENT.b].map((c) => Math.pow(c, 1 / 2.2)) as [number, number, number];
/**
 * Background colour for the current light level. The surfaces darken their sRGB colour by ambient^(1/2.2)
 * (see the *SRGB helpers in screen-light.glsl), so the empty background is darkened the same way; otherwise
 * the real sRGB curve near black leaves the wall visibly lighter than the background around it.
 */
export const litClearColor = (base: Color): Color => {
  const t = screenLightUniforms.uLightsOff.value;
  if (t <= 0) return base;
  const s = base.clone().convertLinearToSRGB();
  darkTarget.setRGB(s.r * ambientSRGB[0], s.g * ambientSRGB[1], s.b * ambientSRGB[2], SRGBColorSpace);
  return clear.copy(base).lerp(darkTarget, t);
};

const destroy = () => {
  gsap.ticker.remove(tick);
  stopWatch?.();
  stopWatch = null;
  spaceMatrix = null;
  screens = [];
};

export const screenLight = { init, destroy };

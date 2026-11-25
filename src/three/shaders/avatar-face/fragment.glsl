#include ../includes/avatar-progress/fragment.glsl;
#include ../includes/screen-light.glsl;

varying vec2 vUv;
varying vec3 vSLWorldPos;
uniform sampler2D uTexture;
uniform float uFrame;

#define ROWS 4.
#define COLUMNS 4.

void main() {
  // Calculate tile position
  float column = mod(uFrame, COLUMNS);
  float row = floor(uFrame / COLUMNS);

  // Flip Y because texture atlases often start from top-left
  row = (ROWS - 1.0) - row;

  // Scale UVs to a single tile
  vec2 uv = vUv;
  uv.x = (uv.x + column) / COLUMNS;
  uv.y = (uv.y + row) / ROWS;

  vec4 textureColor = texture2D(uTexture, uv);
  vec3 slNormal = slFlatNormal(vSLWorldPos);

  float progress = getProgress();

  gl_FragColor = vec4(applyScreenLightFigureSRGB(textureColor.rgb, vSLWorldPos, slNormal), progress * textureColor.a);
}
#include ../includes/avatar-progress/fragment.glsl;
#include ../includes/about-ambient.glsl;
#include ../includes/screen-light.glsl;

uniform sampler2D uHeadTexture;
uniform vec2 uHeadTextureSize;

varying vec2 vUv;
varying vec3 vSLWorldPos;

void main() {
    vec4 tex = texture2D(uHeadTexture, vUv);
    vec3 slNormal = slFlatNormal(vSLWorldPos);

    float progress = getProgress();

    gl_FragColor = vec4(applyScreenLightFigureSRGB(applyAmbient(tex.rgb), vSLWorldPos, slNormal), progress);
}
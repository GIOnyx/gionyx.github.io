#include ../includes/screen-light.glsl;

varying vec2 vUv;
varying vec3 vSLWorldPos;

uniform sampler2D uTexture;
uniform vec3 uColorBackground;
uniform vec3 uColorShadow;

void main() {
    vec4 shadow = texture2D(uTexture, vUv);

    float intensity = shadow.r;

    vec3 color = mix(uColorShadow.rgb, uColorBackground.rgb, intensity);

    vec3 slNormal = slFlatNormal(vSLWorldPos);

    // Lights off: the floor catches screen light, fading out toward the plane's edges so it meets the
    // darkened background without a seam.
    if (uLightsOff > 0.0) {
        float edge = smoothstep(0.0, 0.3, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
        vec3 irr = slIrradiance(vSLWorldPos, slNormal);
        irr = mix(SL_AMBIENT, irr, edge);
        color = mix(color, color * pow(irr, vec3(1.0 / 2.2)), uLightsOff);
    }

    gl_FragColor = vec4(color, 1.);
}

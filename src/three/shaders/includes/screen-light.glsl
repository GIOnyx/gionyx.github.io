// Lights-off shading: the room's baked light is dimmed to a faint ambient, and the two monitors act as
// rectangular area lights (3x3 samples each). Surfaces are lit by how directly they face a screen (N·L),
// how directly the screen faces them (emitter cosine, so nothing behind a monitor is lit), distance, and
// whether anything blocks the screen (shadow maps rendered from each screen, see screen-shadows.ts).

uniform float uLightsOff;
uniform vec3 uScreenPos[2];
uniform vec3 uScreenNormal[2];
uniform vec3 uScreenRight[2];
uniform vec3 uScreenUp[2];
uniform sampler2D uShadowMap0;
uniform sampler2D uShadowMap1;
uniform mat4 uShadowMatrix[2];
uniform sampler2D uUpShadowMap;
uniform mat4 uUpShadowMatrix;
uniform vec2 uUpNearFar;

#define SL_COLOR vec3(0.62, 0.75, 1.0)
#define SL_AMBIENT vec3(0.011, 0.013, 0.026)
#define SL_INTENSITY 7.0
#define SL_FALLOFF 1.5
#define SL_BOUNCE 0.32

// Keep in sync with screen-shadows.ts
#define SL_SHADOW_NEAR 0.06
#define SL_SHADOW_FAR 9.0
#define SL_SHADOW_SIZE 2048.0
#define SL_NORMAL_BIAS 0.012
#define SL_DEPTH_BIAS 0.012
#define SL_UP_SIZE 1024.0
#define SL_UP_BIAS 0.04

// Flat per-pixel normal from screen-space derivatives (the room meshes ship without normals).
vec3 slFlatNormal(vec3 wpos) {
    return normalize(cross(dFdx(wpos), dFdy(wpos)));
}

float slLinearDepth(float d) {
    float z = d * 2.0 - 1.0;
    return 2.0 * SL_SHADOW_NEAR * SL_SHADOW_FAR / (SL_SHADOW_FAR + SL_SHADOW_NEAR - z * (SL_SHADOW_FAR - SL_SHADOW_NEAR));
}

// 1 = fully lit by this screen, 0 = blocked. A 5x5 percentage-closer filter gives the soft edge an area
// light would cast. Anything outside the screen's shadow frustum (straight below or beside the monitor) is
// treated as unlit rather than lit, so light can't leak where the map can't see.
float slShadow(sampler2D map, mat4 shadowMatrix, vec3 wpos, vec3 n) {
    vec4 clip = shadowMatrix * vec4(wpos + n * SL_NORMAL_BIAS, 1.0);
    if (clip.w <= 0.0) return 0.0;
    vec3 ndc = clip.xyz / clip.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    float receiver = slLinearDepth(ndc.z * 0.5 + 0.5) - SL_DEPTH_BIAS;

    float texel = 2.6 / SL_SHADOW_SIZE;
    float lit = 0.0;
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            float occluder = slLinearDepth(texture2D(map, uv + vec2(float(x), float(y)) * texel).r);
            lit += step(receiver, occluder);
        }
    }
    return lit / 25.0;
}

// Top-down visibility for the overhead bounce: 1 = open above, 0 = something (the desk top, the chair
// seat) is above this point. Orthographic, so depth is linear.
float slUpShadow(vec3 wpos, vec3 n) {
    vec4 clip = uUpShadowMatrix * vec4(wpos + n * SL_NORMAL_BIAS, 1.0);
    vec2 uv = clip.xy * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 1.0;
    float range = uUpNearFar.y - uUpNearFar.x;
    float receiver = (clip.z * 0.5 + 0.5) * range - SL_UP_BIAS;

    float texel = 2.5 / SL_UP_SIZE;
    float lit = 0.0;
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            float occluder = texture2D(uUpShadowMap, uv + vec2(float(x), float(y)) * texel).r * range;
            lit += step(receiver, occluder);
        }
    }
    return lit / 25.0;
}

float slScreenTerm(int i, vec3 wpos, vec3 n) {
    float total = 0.0;
    for (int sx = -1; sx <= 1; sx++) {
        for (int sy = -1; sy <= 1; sy++) {
            vec3 p = uScreenPos[i] + uScreenRight[i] * (float(sx) * 0.66) + uScreenUp[i] * (float(sy) * 0.66);
            vec3 L = p - wpos;
            float d2 = max(dot(L, L), 1e-4);
            L *= inversesqrt(d2);
            float ndl = max(dot(n, L), 0.0);
            float emit = max(dot(uScreenNormal[i], -L), 0.0);
            total += ndl * emit / (1.0 + d2 * SL_FALLOFF);
        }
    }
    return total / 9.0;
}

vec3 slIrradiance(vec3 wpos, vec3 n) {
    // Normals always face the viewer so single-sided geometry and derivative normals behave.
    if (dot(n, cameraPosition - wpos) < 0.0) n = -n;

    float s0 = slShadow(uShadowMap0, uShadowMatrix[0], wpos, n);
    float s1 = slShadow(uShadowMap1, uShadowMatrix[1], wpos, n);
    float total = slScreenTerm(0, wpos, n) * s0 + slScreenTerm(1, wpos, n) * s1;

    // Bounce: screen light scattered off the walls and ceiling arrives softly from above, strongest near the
    // screens. It lifts upward-facing surfaces (the top of the head, the desk) over downward-facing ones, so
    // things near the monitors aren't lit only from below.
    vec3 d0 = uScreenPos[0] - wpos;
    vec3 d1 = uScreenPos[1] - wpos;
    float proximity = 1.0 / (1.0 + dot(d0, d0) * SL_FALLOFF) + 1.0 / (1.0 + dot(d1, d1) * SL_FALLOFF);
    float bounce = SL_BOUNCE * proximity * (0.3 + 0.7 * clamp(n.y * 0.5 + 0.5, 0.0, 1.0)) * slUpShadow(wpos, n);

    return SL_AMBIENT + SL_COLOR * (total * SL_INTENSITY + bounce);
}

// For materials that output linear colour (built-in three materials).
vec3 applyScreenLight(vec3 color, vec3 wpos, vec3 n) {
    if (uLightsOff <= 0.0) return color;
    return mix(color, color * slIrradiance(wpos, n), uLightsOff);
}

// For the custom shaders that write sRGB values straight to the screen: light in linear, return sRGB.
vec3 applyScreenLightSRGB(vec3 color, vec3 wpos, vec3 n) {
    if (uLightsOff <= 0.0) return color;
    vec3 lit = color * pow(slIrradiance(wpos, n), vec3(1.0 / 2.2));
    return mix(color, lit, uLightsOff);
}

// The avatar now gets real self-shadowing from the shadow maps, so it uses the same lighting as everything else.
vec3 applyScreenLightFigureSRGB(vec3 color, vec3 wpos, vec3 n) {
    return applyScreenLightSRGB(color, wpos, n);
}

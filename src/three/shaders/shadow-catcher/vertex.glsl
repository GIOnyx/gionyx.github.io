varying vec2 vUv;
varying vec3 vSLWorldPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
    vSLWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
}

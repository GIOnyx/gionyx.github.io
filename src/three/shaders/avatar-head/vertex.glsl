#include <skinning_pars_vertex>
#include ../includes/avatar-progress/vertex.glsl;

varying vec2 vUv;
varying vec3 vSLWorldPos;

void main() {
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>

    #include <project_vertex>

    vModelProgress = getModelProgress(transformed);
    vUv = uv;
    vSLWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
}
precision highp float;

uniform sampler2D depthTex;

varying vec2 v_uv;

const float near_plane = 0.1;
const float far_plane = 50.0;

float LinearizeDepth(float depth) {
  float z = depth * 2.0 - 1.0; // Back to NDC 
  return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

void main () {
  float depth = texture2D(depthTex, v_uv).r;
  gl_FragColor = vec4(vec3(LinearizeDepth(depth) / far_plane), 1.0);
}

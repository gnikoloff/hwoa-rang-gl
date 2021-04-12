attribute vec4 position;
attribute vec2 uv;
attribute vec3 normal;
attribute mat4 instanceModelMatrix;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_position;

void main () {
  vec4 worldPosition = modelMatrix * instanceModelMatrix * position;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  v_uv = uv;
  v_normal = (modelMatrix * vec4(normal, 1.0)).xyz;
  v_position = worldPosition.xyz;
}

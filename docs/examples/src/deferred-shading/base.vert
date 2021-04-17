attribute vec4 position;

#ifdef INCLUDE_UVS
  attribute vec2 uv;

#endif

varying vec2 v_uv;

void main () {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

  #ifdef INCLUDE_UVS
    v_uv = uv;
  #endif
}

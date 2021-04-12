#extension GL_EXT_draw_buffers : require

precision highp float;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_position;

void main () {

  gl_FragData[0] = vec4(v_position, 0.0);
  gl_FragData[1] = vec4(normalize(v_normal.xyz), 0.0);
  gl_FragData[2] = vec4(v_uv, 0.0, 0.0);
}

#extension GL_EXT_draw_buffers : require

precision highp float;

varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_position;

void main () {

  gl_FragData[0] = vec4(v_position, 0.0);
  gl_FragData[1] = vec4(normalize(v_normal.xyz), 0.0);
  gl_FragData[2] = vec4(v_color, 0.0);
}

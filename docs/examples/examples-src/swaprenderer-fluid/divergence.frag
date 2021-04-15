precision mediump sampler2D;
uniform sampler2D velocity;

varying highp vec2 uv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main () {
  float L = texture2D(velocity, vL).x;
  float R = texture2D(velocity, vR).x;
  float T = texture2D(velocity, vT).y;
  float B = texture2D(velocity, vB).y;
  vec2 C = texture2D(velocity, uv).xy;
  
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}

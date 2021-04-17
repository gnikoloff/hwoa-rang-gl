uniform sampler2D velocity;

varying vec2 uv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main () {
  float L = texture2D(velocity, vL).y;
  float R = texture2D(velocity, vR).y;
  float T = texture2D(velocity, vT).x;
  float B = texture2D(velocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}

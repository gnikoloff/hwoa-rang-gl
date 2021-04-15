uniform sampler2D pressure;
uniform float value;

varying vec2 uv;
void main () {
  gl_FragColor = value * texture2D(pressure, uv);
}

uniform sampler2D velocity;
uniform sampler2D pressure;

uniform sampler2D sceneTexture;

uniform float uAlpha;

uniform vec2 px1;
varying vec2 uv;

void main(){
  vec2 vel = texture2D(velocity, uv).xy * 0.5 + vec2(0.5);
  float pre = 0.5 - texture2D(pressure, uv).x  * 0.5;

  vec4 color = vec4(vel, pre, 0.0);
  vec4 baseColor = texture2D(sceneTexture, uv + vel * 0.5 - 0.25);

  gl_FragColor = baseColor;
}

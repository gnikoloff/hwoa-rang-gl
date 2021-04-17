attribute vec4 position;

uniform vec2 px;
varying vec2 uv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

  uv = vec2(0.5)+(gl_Position.xy)*0.5;
  vL = uv - vec2(px.x, 0.0);
  vR = uv + vec2(px.x, 0.0);
  vT = uv + vec2(0.0, px.y);
  vB = uv - vec2(0.0, px.y);
}

uniform vec2 cursor;
uniform vec2 px;

attribute vec4 position;

varying vec2 vPosition;
varying vec2 uv;

void main(){
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  vPosition = gl_Position.xy;
  uv = vec2(0.5) + (gl_Position.xy) * 0.5;
}

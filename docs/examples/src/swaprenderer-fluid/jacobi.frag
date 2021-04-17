uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float alpha;
uniform float beta;
uniform vec2 px;
varying vec2 uv;

varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main(){
  float x0 = texture2D(pressure, vL).r;
  float x1 = texture2D(pressure, vR).r;
  float y0 = texture2D(pressure, vT).r;
  float y1 = texture2D(pressure, vB).r;
  float d = texture2D(divergence, uv).r;
  
  float relaxed = (x0 + x1 + y0 + y1 + alpha * d) * beta;
  gl_FragColor = vec4(relaxed);
}
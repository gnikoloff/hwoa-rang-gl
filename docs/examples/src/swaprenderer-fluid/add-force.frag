uniform sampler2D uBase;
uniform vec2 velocity;
uniform vec2 cursor;
uniform vec2 px;

varying vec2 uv;
varying vec2 vPosition;

float blendAdd(float base, float blend) {
  return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
  return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
  return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

void main(){    
  float dist = distance(cursor/px, vPosition/px);
  vec3 color = texture2D(uBase, uv).rgb;
  float dx = 2.0 * px.x;
  float dy = 2.0 * px.y;
  float marginX = 1.0 - dx;
  float marginY = 1.0 - dy;
  if(dist < 20. && length(dist) > 0. && uv.x < marginX && uv.x > dx && uv.y < marginY && uv.y > dy){
      color = color - vec3(velocity.xy * 10., 0.0) * clamp(2.0 - dist/40., 0.0, 1.0);
  }
  gl_FragColor = vec4(color, 1.0);
}

precision highp float;

uniform vec2 resolution;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;
uniform sampler2D colorTexture;
uniform sampler2D texture;
uniform vec3 lightDirection;

void main () {
  vec2 fragCoord = gl_FragCoord.xy / resolution;

  // vec3 position = texture2D(positionTexture, fragCoord).xyz;
  vec3 normal = normalize(texture2D(normalTexture, fragCoord).xyz);
  vec2 uv = texture2D(colorTexture, fragCoord).xy;

  float light = dot(normal, lightDirection);
  gl_FragColor = texture2D(texture, uv);
  gl_FragColor.rgb *= light * 0.25;
}

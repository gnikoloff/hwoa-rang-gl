precision highp float;

struct PointLightBase {
  vec3 shininessSpecularRadius;
  vec3 position;
  vec3 color;
};

uniform sampler2D positionTexture;
uniform sampler2D normalTexture;
uniform sampler2D colorTexture;
uniform sampler2D texture;
uniform vec3 eyePosition;
uniform vec2 resolution;
uniform PointLightBase PointLight;

void main () {
  vec2 fragCoord = gl_FragCoord.xy / resolution;

  vec3 position = texture2D(positionTexture, fragCoord).xyz;
  vec3 normal = normalize(texture2D(normalTexture, fragCoord).xyz);
  vec2 uv = texture2D(colorTexture, fragCoord).xy;

  vec4 baseColor = texture2D(texture, uv);

  vec3 eyeDirection = normalize(eyePosition - position);
  vec3 lightVec = PointLight.position - position;

  float shininess = PointLight.shininessSpecularRadius.x;
  float lightR = PointLight.shininessSpecularRadius.z;

  float dist = distance(PointLight.position, position) * 2.0;
  if(dist < lightR){
    float attenuation = dist / (1.0 - (dist / lightR) * (dist / lightR));
    attenuation = attenuation / lightR + 1.0;
    attenuation = 1.0 / (attenuation * attenuation);

    // float diffuse = abs(dot(normal, normalize(lightVec)));
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = nDotL * PointLight.color;

    gl_FragColor = vec4(diffuse * PointLight.color * baseColor.rgb * attenuation * shininess, baseColor.a);
  }
}

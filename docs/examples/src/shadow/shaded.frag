struct SpotLightInfo {
  float shininess;
  vec3 lightColor;
  vec3 specularColor;
  vec3 worldPosition;
  vec3 lightDirection;
  float innerLimit;
  float outerLimit;
};

uniform SpotLightInfo SpotLight;
uniform float shadowBias;
uniform sampler2D projectedTexture;
uniform vec3 eyePosition;
  
varying vec4 v_projectedTexcoord;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main () {
  // Shadow
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  float currentDepth = projectedTexcoord.z + shadowBias;
  
  bool inRange = 
      projectedTexcoord.x >= 0.0 &&
      projectedTexcoord.x <= 1.0 &&
      projectedTexcoord.y >= 0.0 &&
      projectedTexcoord.y <= 1.0;
  
  vec4 texColor = vec4(vec3(0.25), 1.0);
  float projectedDepth = texture2D(projectedTexture, projectedTexcoord.xy).r;
  float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0; 

  // Spot light
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);

  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float dotFromDirection = dot(surfaceToLightDirection, -SpotLight.lightDirection);
  float limitRange = SpotLight.innerLimit - SpotLight.outerLimit;
  float inLight = clamp((dotFromDirection - SpotLight.outerLimit) / limitRange, 0.0, 1.0);

  float light = inLight * dot(normal, surfaceToLightDirection);
  float specular = inLight * pow(dot(normal, halfVector), SpotLight.shininess);

  
  // gl_FragColor = vec4(texColor.rgb * shadowLight, texColor.a);

  gl_FragColor = vec4(
    texColor.rgb * SpotLight.lightColor * light * shadowLight +
    specular * SpotLight.specularColor * shadowLight,
    texColor.a
  );
}
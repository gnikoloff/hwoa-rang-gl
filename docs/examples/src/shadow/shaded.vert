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
uniform mat4 textureMatrix;
uniform vec3 eyePosition;

attribute vec4 position;
attribute vec2 uv;
attribute vec3 normal;

#ifdef IS_INSTANCED
  attribute mat4 instanceModelMatrix;
#endif
  
varying vec4 v_projectedTexcoord;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
  vec4 worldPosition;

  #ifdef IS_INSTANCED
    worldPosition = modelMatrix * instanceModelMatrix * position;
  #else
    worldPosition = modelMatrix * position;
  #endif
  
  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  v_uv = uv;
  v_projectedTexcoord = textureMatrix * worldPosition;

  vec3 surfaceWorldPosition = worldPosition.xyz;

  v_surfaceToLight = SpotLight.worldPosition - surfaceWorldPosition;
  v_surfaceToView = eyePosition - surfaceWorldPosition;
  v_uv = uv;
  v_normal = mat3(modelMatrix) * normal;
}
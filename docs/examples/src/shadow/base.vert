attribute vec4 position;

#ifdef IS_INSTANCED
  attribute mat4 instanceModelMatrix;
#endif

#ifdef USE_PROJECTED_TEXCOORD
  uniform mat4 textureMatrix;

  varying vec4 v_projectedTexcoord;
#endif

#ifdef USE_VARYINGS
  attribute vec2 uv;

  varying vec2 v_uv;
#endif

void main() {
  
  
  #ifdef IS_INSTANCED
    vec4 worldPosition = modelMatrix * instanceModelMatrix * position;
  #else
    vec4 worldPosition = modelMatrix * position;
  #endif
  
  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  #ifdef USE_VARYINGS
    v_uv = uv;
  #endif

  #ifdef USE_PROJECTED_TEXCOORD
    v_projectedTexcoord = textureMatrix * worldPosition;
  #endif
}
import Stats from 'stats-js'

import {
  Geometry,
  Mesh,
  getExtension,
  SwapRenderer,
  OrthographicCamera,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const VERTEX_SHADER_UPDATE_POSITIONS = `
  attribute vec4 position;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  }
`

const FRAGMENT_SHADER_UPDATE_POSITIONS = `
  uniform sampler2D positionsTexture;
  uniform sampler2D velocitiesTexture;
  uniform vec2 textureDimensions;
  uniform vec2 canvasDimensions;
  uniform vec3 mousePos;
  uniform float deltaTime;
  uniform float curlNoiseFactor;
  uniform float positionFactor;

  vec2 euclideanModulo(vec2 n, vec2 m) {
    return mod(mod(n, m) + m, m);
  }

  vec4 permute(vec4 x){return mod(x*x*34.+x,289.);}
  float snoise(vec3 v){
    const vec2 C = 1./vec2(6,3);
    const vec4 D = vec4(0,.5,1,2);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - D.yyy;
    i = mod(i,289.);
    vec4 p = permute( permute( permute(
      i.z + vec4(0., i1.z, i2.z, 1.))
    + i.y + vec4(0., i1.y, i2.y, 1.))
    + i.x + vec4(0., i1.x, i2.x, 1.));
    vec3 ns = .142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = floor(j - 7. * x_ ) *ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 sh = -step(h, vec4(0));
    vec4 a0 = b0.xzyw + (floor(b0)*2.+ 1.).xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + (floor(b1)*2.+ 1.).xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.);
    return .5 + 12. * dot( m * m * m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );
  }

  vec3 snoiseVec3( vec3 x ){
    return vec3(  snoise(vec3( x )*2.-1.),
                  snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ))*2.-1.,
                  snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 )*2.-1.)
    );
  }

  vec3 curlNoise( vec3 p ){
    const float e = .1;
    vec3 dx = vec3( e   , 0.0 , 0.0 );
    vec3 dy = vec3( 0.0 , e   , 0.0 );
    vec3 dz = vec3( 0.0 , 0.0 , e   );

    vec3 p_x0 = snoiseVec3( p - dx );
    vec3 p_x1 = snoiseVec3( p + dx );
    vec3 p_y0 = snoiseVec3( p - dy );
    vec3 p_y1 = snoiseVec3( p + dy );
    vec3 p_z0 = snoiseVec3( p - dz );
    vec3 p_z1 = snoiseVec3( p + dz );

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / ( 2.0 * e );
    return normalize( vec3( x , y , z ) * divisor );
  }

  void main () {
    vec2 texCoords = gl_FragCoord.xy / textureDimensions;
    vec2 position = texture2D(positionsTexture, texCoords).xy;
    vec2 velocity = texture2D(velocitiesTexture, texCoords).xy;
    vec2 newPosition = euclideanModulo(position + curlNoise(vec3(position.xy * positionFactor, 0.0)).xy * curlNoiseFactor * deltaTime, canvasDimensions);
    gl_FragColor = vec4(newPosition, 1, 1);
  }
`

const VERTEX_SHADER_PARTICLES = `
  attribute vec4 position;
  
  uniform sampler2D positionsTexture;
  uniform vec2 textureDimensions;

  vec4 getValFromTextureArray (sampler2D texture, vec2 dimensions, float index) {
    float y = floor(index / dimensions.x);
    float x = mod(index, dimensions.x);
    vec2 texCoords = (vec2(x, y) + 0.5) / dimensions;
    return texture2D(texture, texCoords);
  }

  void main () {
    float id = position.x;
    vec4 newPos = getValFromTextureArray(positionsTexture, textureDimensions, id);
    gl_Position = projectionMatrix * vec4(newPos.xy, 0, 1);
    gl_PointSize = 2.0;
  }
`

const FRAGMENT_SHADER_PARTICLES = `
  void main () {
    gl_FragColor = vec4(vec3(0.4), 1.0);
  }
`

const POSITIONS1_PROGRAM = 'position1'
const POSITIONS2_PROGRAM = 'position2'
const VELOCITY_PROGRAM = 'velocity'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const errorLogWrapper = document.getElementById('error-log')
const infoLogWrapper = document.getElementById('info-log')

const particleTexWidth = 500
const particleTexHeight = 500
const numParticles = particleTexWidth * particleTexHeight
const ids = new Array(numParticles)

for (let i = 0; i < numParticles; i++) {
  ids[i] = i
}

getExtension(gl, 'GMAN_debug_helper')

checkExtensionsSupport()

const orthoCamera = new OrthographicCamera(0, innerWidth, innerHeight, 0, -1, 1)
orthoCamera.position = [0, 0, 1]
orthoCamera.lookAt([0, 0, 0])

// const orthoProjectionMatrix = mat4.create()
// {
//   const left = 0
//   const right = innerWidth
//   const bottom = 0
//   const top = innerHeight
//   const near = -1
//   const far = 1
//   mat4.ortho(orthoProjectionMatrix, left, right, bottom, top, near, far)
// }

const swapRenderer = new SwapRenderer(gl)

swapRenderer
  .createProgram(
    'updatePosition',
    VERTEX_SHADER_UPDATE_POSITIONS,
    FRAGMENT_SHADER_UPDATE_POSITIONS,
  )
  .useProgram('updatePosition')
  .setUniform('positionsTexture', UNIFORM_TYPE_INT, 0)
  .setUniform('velocitiesTexture', UNIFORM_TYPE_INT, 1)
  .setUniform('textureDimensions', UNIFORM_TYPE_VEC2, [
    particleTexWidth,
    particleTexHeight,
  ])
  .setUniform('canvasDimensions', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])
  .setUniform('deltaTime', UNIFORM_TYPE_FLOAT, 0)
  .setUniform('curlNoiseFactor', UNIFORM_TYPE_FLOAT, 200)
  .setUniform('positionFactor', UNIFORM_TYPE_FLOAT, 0.005)

const positions = new Float32Array(
  ids.map(() => [rand(innerWidth), rand(innerHeight), 0, 0]).flat(),
)
const velocities = new Float32Array(
  ids.map(() => [rand(-300, 300), rand(-300, 300), 0, 0]).flat(),
)

swapRenderer
  .createTexture(
    POSITIONS1_PROGRAM,
    particleTexWidth,
    particleTexHeight,
    positions,
  )
  .createFramebuffer(POSITIONS1_PROGRAM, particleTexWidth, particleTexHeight)

  .createTexture(POSITIONS2_PROGRAM, particleTexWidth, particleTexHeight)
  .createFramebuffer(POSITIONS2_PROGRAM, particleTexWidth, particleTexHeight)

  .createTexture(
    VELOCITY_PROGRAM,
    particleTexWidth,
    particleTexHeight,
    velocities,
  )
  .createFramebuffer(VELOCITY_PROGRAM, particleTexWidth, particleTexHeight)

infoLogWrapper.innerText = `Rendering ${humanizeNumber(numParticles)} particles`

let oldTime = 0
let drawMesh

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)

{
  const geometry = new Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: new Float32Array(ids),
    size: 1,
  })
  const textureDimensions = [particleTexWidth, particleTexHeight]
  drawMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      positionsTexture: { type: UNIFORM_TYPE_INT, value: 0 },
      textureDimensions: { type: UNIFORM_TYPE_VEC2, value: textureDimensions },
    },
    vertexShaderSource: VERTEX_SHADER_PARTICLES,
    fragmentShaderSource: FRAGMENT_SHADER_PARTICLES,
  })
  drawMesh.drawMode = 0
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)
document.addEventListener('click', () => {
  const positions = new Float32Array(
    ids.map(() => [rand(innerWidth), rand(innerHeight), 0, 0]).flat(),
  )
  swapRenderer
    .createTexture(
      POSITIONS1_PROGRAM,
      particleTexWidth,
      particleTexHeight,
      positions,
    )
    .createFramebuffer(POSITIONS1_PROGRAM, particleTexWidth, particleTexHeight)
    .useProgram('updatePosition')
    .setUniform(
      'curlNoiseFactor',
      UNIFORM_TYPE_FLOAT,
      150 + Math.random() * 100,
    )
    .setUniform(
      'positionFactor',
      UNIFORM_TYPE_FLOAT,
      0.001 + Math.random() * 0.009,
    )
})

function updateFrame(ts) {
  ts /= 4000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  swapRenderer
    .setSize(particleTexWidth, particleTexHeight)
    .useProgram('updatePosition')
    .setUniform('deltaTime', UNIFORM_TYPE_FLOAT, dt)
    .run([POSITIONS1_PROGRAM, VELOCITY_PROGRAM], POSITIONS2_PROGRAM)

  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

  const posTexture = swapRenderer.getTexture(POSITIONS1_PROGRAM)

  gl.activeTexture(gl.TEXTURE0)
  posTexture.bind()

  drawMesh.use().setCamera(orthoCamera).draw()

  swapRenderer.swap(POSITIONS1_PROGRAM, POSITIONS2_PROGRAM)

  stats.end()

  requestAnimationFrame(updateFrame)
}

function rand(min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }
  return Math.random() * (max - min) + min
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

function checkExtensionsSupport() {
  // check we can use floating point textures
  const ext1 = getExtension(gl, 'OES_texture_float')
  if (!ext1) {
    errorLogWrapper.style.display = 'flex'
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `
  }
  if (!getExtension(gl, 'WEBGL_color_buffer_float')) {
    errorLogWrapper.style.display = 'flex'
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need WEBGL_color_buffer_float</p>
  `
  }
  // check we can use textures in a vertex shader
  if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1) {
    errorLogWrapper.style.display = 'flex'
    errorLogWrapper.innerHTML += `
    <p>⚠️ Can not use textures in vertex shaders</p>
  `
  }
}

function humanizeNumber(number, { digits = 0 } = {}) {
  const THOUSAND = 1000
  const MILLION = 1000000
  const BILLION = 1000000000

  const roundingBase = Math.pow(10, digits)
  if (number > BILLION) {
    return `${Math.round((number / BILLION) * roundingBase) / roundingBase}mrd`
  }
  if (number > MILLION) {
    return `${Math.round((number / MILLION) * roundingBase) / roundingBase}m`
  }
  if (number > THOUSAND) {
    return `${Math.round((number / THOUSAND) * roundingBase) / roundingBase}k`
  }
}

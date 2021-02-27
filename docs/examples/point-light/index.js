const BALLS_COUNT_SIZE = 8
const NUM_BALLS = BALLS_COUNT_SIZE * BALLS_COUNT_SIZE * BALLS_COUNT_SIZE

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const instanceMatrix = mat4.create()
const translateVector = vec3.create()

let sphereMesh
let texture
let oldTime = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 20]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera)

const lightWorldPosition = vec3.create()
vec3.set(lightWorldPosition, 0, 40, 40)

const lightDirection = vec3.create()
vec3.set(lightDirection, 0, 1, 1)
vec3.normalize(lightDirection, lightDirection)

{
  const { indices, vertices, normal } = hwoaRangGL.GeometryUtils.createSphere({
    widthSegments: 20,
    heightSegments: 20
  })
  const geometry = new hwoaRangGL.Geometry(gl)

  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('normal', {
      typedArray: normal,
      size: 3,
    })

  sphereMesh = new hwoaRangGL.InstancedMesh(gl, {
    geometry,
    instanceCount: NUM_BALLS,
    uniforms: {
      eyePosition: { type: 'vec3', value: camera.position },
      lightWorldPosition: { type: 'vec3', value: lightWorldPosition },
      lightDirection: { type: 'vec3', value: lightDirection },
    },
    vertexShaderSource: `
        uniform vec3 lightWorldPosition;
        uniform vec3 eyePosition;

        attribute vec4 position;
        attribute vec3 normal;
        attribute mat4 instanceModelMatrix;

        varying vec3 v_normal;

        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;

        void main () {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceModelMatrix * position;
          v_normal = mat3(modelMatrix * instanceModelMatrix) * normal;

          vec3 surfaceWorldPosition = (modelMatrix * instanceModelMatrix * position).xyz;
          v_surfaceToLight = lightWorldPosition - surfaceWorldPosition;
          v_surfaceToView = eyePosition - surfaceWorldPosition;
        }
      `,
      fragmentShaderSource: `
        uniform vec3 lightDirection;

        varying vec3 v_normal;
        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;
        
        const float shininess = 100.0;

        void main () {
          vec3 normal = normalize(v_normal);
          vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
          vec3 surfaceToViewDirection = normalize(v_surfaceToView);

          vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

          float pointLight = dot(normal, surfaceToLightDirection);
          float directionalLight = dot(normal, lightDirection);

          float specular = 0.0;
          if (pointLight > 0.0) {
            specular = pow(dot(normal, halfVector), shininess);
          }
          
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
          gl_FragColor.rgb *= pointLight;
          gl_FragColor.rgb += specular;

        }
      `
  })

  let idx = 0
  const scale = 1.5
  for (let i = 0; i < BALLS_COUNT_SIZE; i++) {
    for (let n = 0; n < BALLS_COUNT_SIZE; n++) {
      for (let j = 0; j < BALLS_COUNT_SIZE; j++) {
        const x = (i - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        const y = (n - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        const z = (j - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        mat4.identity(instanceMatrix)
        vec3.set(translateVector, x, y, z)
        mat4.translate(instanceMatrix, instanceMatrix, translateVector)
        sphereMesh.setMatrixAt(idx, instanceMatrix)
        idx++
      }
    }
  }

  // for (let i = 0; i < NUM_BALLS; i++) {
  //   const x = i / (BALLS_COUNT_SIZE * BALLS_COUNT_SIZE) % BALLS_COUNT_SIZE - BALLS_COUNT_SIZE / 2
  //   const y = i / BALLS_COUNT_SIZE % BALLS_COUNT_SIZE - BALLS_COUNT_SIZE / 2
  //   const z = i % BALLS_COUNT_SIZE - BALLS_COUNT_SIZE / 2
    
  // }
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.05, 0.05, 0.05, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  vec3.set(lightWorldPosition, lightWorldPosition[0], 0, Math.sin(ts * 0.3) * 8)
  sphereMesh.setUniform('lightWorldPosition', 'vec3', lightWorldPosition)
  sphereMesh.setUniform('eyePosition', 'vec3', camera.position)
  sphereMesh.setCamera(camera)
  sphereMesh.draw()  

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

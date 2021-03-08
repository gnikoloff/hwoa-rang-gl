const OPTIONS = {
  tweenFactor: 1,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0
let mesh
let tweenTarget = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
// gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
// gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [-5, 0, 15]
camera.lookAt([0, 0, 0])

setInterval(() => {
  tweenTarget = tweenTarget === 0 ? 1 : 0
}, 5000)

new hwoaRangGL.CameraController(camera)

{
  let vertices = generateTextVertices('hwoa-rang-gl')
  let vertices2 = generateTextVertices('webgl-library')

  let finalCount

  if (vertices.length !== vertices2.length) {
    if (vertices.length > vertices2.length) {
      finalCount = vertices.length / 2
      for (let i = vertices2.length; i < vertices.length; i++) {
        vertices2[i] = vertices[3]
      }
    }
    if (vertices2.length > vertices.length) {
      finalCount = vertices2.length / 2
      for (let i = vertices.length; i < vertices2.length; i++) {
        vertices[i] = vertices2[3]
      }
    }
  }

  const animAttribs = new Float32Array(finalCount * 4)

  vertices = new Float32Array(vertices)
  vertices2 = new Float32Array(vertices2)

  for (let i = 0; i < finalCount; i++) {
    animAttribs[i * 4 + 0] = Math.random() * 2 - 1
    animAttribs[i * 4 + 1] = Math.random() * 2 - 1
    animAttribs[i * 4 + 2] = Math.random() * 2 - 1
    animAttribs[i * 4 + 3] = i / finalCount / 2
  }

  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addAttribute('position', {
      typedArray: vertices,
      size: 2,
    })
    .addAttribute('position2', {
      typedArray: vertices2,
      size: 2,
    })
    .addAttribute('animAttrib', {
      typedArray: animAttribs,
      size: 4,
    })
  mesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      time: { type: 'float', value: 0 },
      tweenFactor: { type: 'float', value: OPTIONS.tweenFactor },
    },
    vertexShaderSource: `
      uniform float tweenFactor;
      uniform float time;

      attribute vec4 position;
      attribute vec4 position2;
      attribute vec4 animAttrib;

      #define PI 3.141592653589793
      #define step ${250 / finalCount}
      
      mat4 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
      }

      vec4 rotate(vec3 v, vec3 axis, float angle) {
        mat4 m = rotationMatrix(axis, angle);
        return m * vec4(v, 1.0);
      }

      float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      }

      void main () {
        vec4 pos = mix(position, position2, tweenFactor);

        vec4 animPos = rotate(
          pos.xyz,
          (animAttrib.xyz + pos.xyz),
          map(tweenFactor, animAttrib.w, animAttrib.w + step, 0.0, 1.0)
        );

        pos += animPos * sin(tweenFactor * PI) * 2.0;

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos;
        gl_PointSize = 3.0;
      }
    `,
    fragmentShaderSource: `
      void main () {
        gl_FragColor = vec4(normalize(gl_FragCoord.xyz) * 0.5, 1.0);
      }
    `,
  })
  const scale = 2
  mesh.setScale({ x: scale, y: scale, z: scale })
  mesh.drawMode = 0
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
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // OPTIONS.tweenFactor = (Math.sin(ts) + 1) * 0.5
  OPTIONS.tweenFactor +=
    (tweenTarget - OPTIONS.tweenFactor) * easeOutCirc(dt * 0.175)

  mesh
    .setUniform('time', 'float', ts)
    .setUniform('tweenFactor', 'float', OPTIONS.tweenFactor)
    .setCamera(camera)
    .draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

function generateTextVertices(text, { size = 512, fontSize = 80 } = {}) {
  const canvas = document.createElement('canvas')
  // document.body.appendChild(canvas)
  // canvas.setAttribute(
  //   'style',
  //   `
  //   position: fixed;
  //   top: 0;
  //   right: 0;
  // `,
  // )
  const ctx = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const {
    data: { buffer },
  } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const data = new Uint32Array(buffer)
  const gridSpacer = 2
  const verticesArr = []

  for (let x = 0; x < size; x += gridSpacer) {
    for (let y = 0; y < size; y += gridSpacer) {
      if (data[x + y * size]) {
        verticesArr.push((x / size - 0.5) * 10, ((size - y) / size - 0.5) * 10)
      }
    }
  }

  return verticesArr
}

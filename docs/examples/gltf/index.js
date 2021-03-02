const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const gltfInfo = document.getElementById('gltf-info')

let oldTime = 0
let gJson
let gBin
let gltfMesh
let texture

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 5]
camera.lookAt([0, 0, 0])

const lightDirection = vec3.create()
vec3.set(lightDirection, 1, 1, 1)
vec3.normalize(lightDirection, lightDirection)

new hwoaRangGL.CameraController(camera)

downloadFile('./Suzanne.gltf', 'json', loadModel)
downloadFile('./Suzanne.bin', 'arraybuffer', loadModel)

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function loadModel(xhr) {
  if (xhr.responseType === 'json') {
    gJson = xhr.response
  } else if (xhr.responseType === 'arraybuffer') {
    gBin = xhr.response
  }
  if (!gJson || !gBin) {
    return
  }
  const meshName = 'Suzanne'
  const prim = GLTF.getMesh(meshName, gJson, gBin)
  gltfInfo.textContent = `Vertex count: ${prim[0].vertices.elmCount}`

  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addIndex({
      typedArray: prim[0].indices.data,
    })
    .addAttribute('position', {
      typedArray: prim[0].vertices.data,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: prim[0].uv.data,
      size: 2,
    })
    .addAttribute('normal', {
      typedArray: prim[0].normal.data,
      size: 3,
    })

  gltfMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      lightDirection: { type: 'vec3', value: lightDirection },
      diffuse: { type: 'int', value: 0 },
    },
    vertexShaderSource: `
      attribute vec4 position;
      attribute vec2 uv;
      attribute vec3 normal;

      varying vec2 v_uv;
      varying vec3 v_normal;

      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
        v_uv = uv;

        v_normal = mat3(modelMatrix) * normal;
      }
    `,
    fragmentShaderSource: `
      uniform vec3 lightDirection;
      uniform sampler2D diffuse;

      varying vec2 v_uv;
      varying vec3 v_normal;

      void main () {
        vec3 normal = normalize(v_normal);
        float light = dot(normal, lightDirection);
        
        gl_FragColor = texture2D(diffuse, v_uv);
        gl_FragColor.rgb += normal * 0.5;
        gl_FragColor.rgb *= light;
      }
    `,
  })

  const image = new Image()
  image.onload = () => {
    texture = new hwoaRangGL.Texture(gl, {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
  }
  image.src = './Suzanne_BaseColor.png'
}

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (texture) {
    texture.bind()
  }
  if (gltfMesh) {
    gltfMesh.setCamera(camera).draw()
  }

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

function downloadFile(url, type, callback) {
  const xhr = new XMLHttpRequest()
  xhr.addEventListener(
    'load',
    (e) => {
      if (xhr.status !== 200) {
        // ...
      }
      callback(xhr)
    },
    false,
  )
  xhr.addEventListener(
    'error',
    (e) => {
      // ...
    },
    false,
  )
  xhr.addEventListener(
    'abort',
    (e) => {
      // ...
    },
    false,
  )
  xhr.addEventListener(
    'timeout',
    (e) => {
      // ...
    },
    false,
  )

  xhr.open('GET', url)
  xhr.responseType = type

  try {
    xhr.send()
  } catch (err) {
    console.error(`Could not send XHR: ${err}`)
  }
}

const COUNT_SIDE = 12
const BOXES_COUNT = COUNT_SIDE * COUNT_SIDE
const BLUR_ITERATIONS = 24
const BACKGROUND_COLOR = [0.1, 0.1, 0.1, 1.9]
const SCALE_DOWN_POSTFX = 10

const OPTS = {
  debugMode: false,
}

const gui = new dat.GUI()

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const stats = new Stats()
document.body.appendChild(stats.domElement)

let oldTime = 0

let boxesMesh
let sphereMesh
let planeMesh

gl.enable(gl.BLEND)
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

const renderTargetBlurX = new hwoaRangGL.RenderTarget(gl, {
  width: innerWidth / SCALE_DOWN_POSTFX,
  height: innerHeight / SCALE_DOWN_POSTFX,
})
const renderTargetBlurY = new hwoaRangGL.RenderTarget(gl, {
  width: innerWidth / SCALE_DOWN_POSTFX,
  height: innerHeight / SCALE_DOWN_POSTFX,
})

/* ----- Instanced Boxes ------ */
{
  const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createBox()
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    })
  boxesMesh = new hwoaRangGL.InstancedMesh(gl, {
    geometry,
    instanceCount: BOXES_COUNT,
    vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;
    attribute mat4 instanceModelMatrix;

    varying vec2 v_uv;

    void main () {
      gl_Position = projectionMatrix *
                    viewMatrix *
                    modelMatrix *
                    instanceModelMatrix *
                    position;
      v_uv = uv;
    }
  `,
    fragmentShaderSource: `
      uniform bool debugMode;
      varying vec2 v_uv;
      void main () {
        if (debugMode) {
          gl_FragColor = vec4(v_uv.x, 0.1, v_uv.y, 1.0);
        } else {
          gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
        }
      }
    `,
  })
}

/* ----- Sphere ------ */
{
  const { indices, vertices } = hwoaRangGL.GeometryUtils.createSphere({
    radius: 2,
    widthSegments: 24,
    heightSegments: 24,
  })
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  sphereMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    vertexShaderSource: `
      attribute vec4 position;

      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      }
    `,
    fragmentShaderSource: `
      void main () {
        gl_FragColor = vec4(1.0);
      }
    `,
  })
}

/* ----- Fullscreen Quad ------ */
const { vertices, uv } = hwoaRangGL.GeometryUtils.createFullscreenQuad()
const geometry = new hwoaRangGL.Geometry(gl)
geometry
  .addAttribute('position', {
    typedArray: vertices,
    size: 2,
  })
  .addAttribute('uv', {
    typedArray: uv,
    size: 2,
  })
planeMesh = new hwoaRangGL.Mesh(gl, {
  geometry,
  uniforms: {
    diffuse: { type: 'int', value: 0 },
    mask: { type: 'int', value: 1 },
    blurDirection: { type: 'vec2', value: [0, 1] },
  },
  vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 v_uv;

    void main () {
      gl_Position = position;

      v_uv = uv;
    }
  `,
  fragmentShaderSource: `
    uniform sampler2D diffuse;
    uniform sampler2D mask;
    uniform vec2 blurDirection;

    varying vec2 v_uv;

    vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
      vec4 color = vec4(0.0);
      vec2 off1 = vec2(1.3846153846) * direction;
      vec2 off2 = vec2(3.2307692308) * direction;
      color += texture2D(image, uv) * 0.2270270270;
      color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
      color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
      return color;
    }

    void main () {
      vec2 resolution = vec2(${innerWidth}.0, ${innerHeight}.0);
      vec4 maskColor = texture2D(mask, v_uv);
      gl_FragColor = mix(
        blur9(diffuse, v_uv, resolution, blurDirection),
        vec4(0.1, 0.1, 0.1, 1.0),
        maskColor.r
      );
    }
  `,
})

const matrix = mat4.create()
const translateVec = vec3.create()
const scaleVec = vec4.create()

for (let i = 0; i < BOXES_COUNT; i++) {
  const x = (i % COUNT_SIDE) - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3
  const y = (i - x) / COUNT_SIDE - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3
  mat4.identity(matrix)
  vec3.set(translateVec, x, y, 0)
  mat4.translate(matrix, matrix, translateVec)

  const angle = Math.random() * Math.PI * 2

  mat4.rotateX(matrix, matrix, angle)
  mat4.rotateZ(matrix, matrix, angle)

  const scale = 0.5 + Math.random() * 0.7
  vec3.set(scaleVec, scale, scale, scale)
  mat4.scale(matrix, matrix, scaleVec)
  boxesMesh.setMatrixAt(i, matrix)
}

gui.add(OPTS, 'debugMode').onChange((val) => {
  boxesMesh.setUniform('debugMode', 'float', val)
})

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  let writeBuffer = renderTargetBlurX
  let readBuffer = renderTargetBlurY

  if (!OPTS.debugMode) {
    renderTargetBlurX.bind()
    gl.clearColor(...BACKGROUND_COLOR)
    gl.viewport(
      0,
      0,
      innerWidth / SCALE_DOWN_POSTFX,
      innerHeight / SCALE_DOWN_POSTFX,
    )
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  } else {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(...BACKGROUND_COLOR)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  sphereMesh
    .setCamera(camera)
    .setPosition({
      x: Math.sin(ts) * 4,
      y: Math.cos(ts) * 3,
      z: -5,
    })
    .draw()

  boxesMesh.setCamera(camera).draw()

  if (!OPTS.debugMode) {
    renderTargetBlurX.unbind()

    for (let i = 0; i < BLUR_ITERATIONS; i++) {
      readBuffer.bind()
      writeBuffer.bindTexture()
      const radius = BLUR_ITERATIONS - i - 1
      planeMesh
        .setUniform(
          'blurDirection',
          'vec2',
          i % 2 === 0 ? [radius, 0] : [0, radius],
        )
        .draw()
      // readBuffer.unbindTexture()

      let t = writeBuffer
      writeBuffer = readBuffer
      readBuffer = t
    }

    writeBuffer.unbind()

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(...BACKGROUND_COLOR)
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    readBuffer.bindTexture()

    planeMesh.draw()
  }

  // readBuffer.unbindTexture()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

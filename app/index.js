const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

gl.isWebGL2 = gl instanceof WebGL2RenderingContext

document.body.appendChild(canvas)
resize()
window.addEventListener('resize', resize)
requestAnimationFrame(updateFrame)

function updateFrame (ts) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  

  requestAnimationFrame(updateFrame)
}

function resize () {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', innerWidth)
  canvas.style.setProperty('height', innerHeight)
}
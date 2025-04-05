// Webgl

import { updateFpsDisplay } from './fpsdisplay'

let canvasDimensions: [number, number] = [320, 200]
let oldTime: number = 0

export const render =
  (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => (time: number) => {
    if (oldTime <= 0) {
      oldTime = time
    }
    // in seconds
    const deltaTime = (time - oldTime) / 1000
    oldTime = time

    updateFpsDisplay(deltaTime)

    canvas.width = canvasDimensions[0]
    canvas.height = canvasDimensions[1]
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.clearColor(0.1, 0.2, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    requestAnimationFrame(render(gl, canvas))
  }

export const setupCanvas = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) {
    throw 'No canvas on document'
  }
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    throw 'Unable to initialize webgl2'
  }

  const observer = new ResizeObserver(() => {
    canvasDimensions[0] = canvas.clientWidth
    canvasDimensions[1] = canvas.clientHeight
  })
  observer.observe(canvas)

  requestAnimationFrame(render(gl, canvas))
}

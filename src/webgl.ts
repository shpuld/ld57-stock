// Webgl

import { updateFpsDisplay } from './fpsdisplay'
import { Mat4 } from './utils'
let canvasDimensions: [number, number] = [320, 200]
let oldTime: number = 0

export type VertexArray = {
  numVerts: number
  type: 'STRIP' | 'TRIANGLES'
  data: Float32Array
  dynamicHint: 'STATIC_DRAW' | 'DYNAMIC_DRAW'
}

export type RenderObject = {
  transform: Mat4
  verts: VertexArray
}

const vShader = `#version 300 es
in vec2 a_pos;

uniform vec3 u_pos;

void main() {
  gl_Position = vec3(u_pos.xy + a_pos * 0.1f, u_pos.z, 1.0f);
}
`

const fShader = `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0f, 1.0f, 0.0f, 1.0f);
}
`

const compileShader = (
  gl: WebGL2RenderingContext,
  source: string,
  type: number,
) => {
  const shader = gl.createShader(type)
  if (shader) {
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
      // Something went wrong during compilation; get the error
      throw `Error compiling shader: ${gl.getShaderInfoLog(shader)}`
    }

    return shader
  }
  throw 'Could not create shader'
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

  const program = gl.createProgram()

  if (program) {
    const vertexShader = compileShader(gl, vShader, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(gl, fShader, gl.FRAGMENT_SHADER)
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
      throw `Failed to link shader program: ${gl.getProgramInfoLog(program)}`
    }
  } else {
    throw 'Could not create program'
  }

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_pos')
  // use uniforms for 3d position, scale, camera vectors
  const spriteGeometry = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ])

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, spriteGeometry, gl.STATIC_DRAW)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  const render = (time: number) => {
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

    gl.useProgram(program)
    gl.bindVertexArray(vao)

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

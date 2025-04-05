export type Vec3 = [number, number, number]
export type Vec2 = [number, number]
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export const vec3 = {
  from: (x: number, y: number, z: number): Vec3 => [x, y, z],
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  addOut: (a: Vec3, b: Vec3, out: Vec3): void => {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
  },
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  subOut: (a: Vec3, b: Vec3, out: Vec3): void => {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
  },
  scale: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],
  scaleOut: (a: Vec3, s: number, out: Vec3): void => {
    out[0] = a[0] * s
    out[1] = a[1] * s
    out[2] = a[2] * s
  },
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  length: (a: Vec3): number =>
    Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),
  normalize: (a: Vec3): Vec3 => {
    const length = vec3.length(a)
    return [a[0] / length, a[1] / length, a[2] / length]
  },
  normalizeOut: (a: Vec3, out: Vec3): void => {
    const length = vec3.length(a)
    out[0] = a[0] / length
    out[1] = a[1] / length
    out[2] = a[2] / length
  },
  cross: (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
  crossOut: (a: Vec3, b: Vec3, out: Vec3): void => {
    out[0] = a[1] * b[2] - a[2] * b[1]
    out[1] = a[2] * b[0] - a[0] * b[2]
    out[2] = a[0] * b[1] - a[1] * b[0]
  },
}

export const vec2 = {
  from: (x: number, y: number): Vec2 => [x, y],
  add: (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]],
  addOut: (a: Vec2, b: Vec2, out: Vec2): void => {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
  },
  sub: (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]],
  subOut: (a: Vec2, b: Vec2, out: Vec2): void => {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
  },
  scale: (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s],
  scaleOut: (a: Vec2, s: number, out: Vec2): void => {
    out[0] = a[0] * s
    out[1] = a[1] * s
  },
  dot: (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1],
  length: (a: Vec2): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]),
  normalize: (a: Vec2): Vec2 => {
    const length = vec2.length(a)
    return [a[0] / length, a[1] / length]
  },
  normalizeOut: (a: Vec2, out: Vec2): void => {
    const length = vec2.length(a)
    out[0] = a[0] / length
    out[1] = a[1] / length
  },
}

export const mat4 = {}

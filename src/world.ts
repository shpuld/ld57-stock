import { vec2, Vec2 } from './utils'

export enum StaticObjectType {
  BOULDER,
  ROCK,
  GOLD_ORE,
  IRON_ORE,
  DIAMOND_ORE,
}

export type StaticObject = {
  position: Vec2
  type: StaticObjectType
  scale: number
  collisionRadius: number
  hasCollision: boolean
  health: number
}

export const world: StaticObject[] = []

export const addStaticObject = (
  overwrite: Partial<StaticObject>,
): StaticObject => {
  const object = {
    position: vec2.from(0, 0),
    type: StaticObjectType.BOULDER,
    scale: 1.0,
    collisionRadius: 1.0,
    hasCollision: true,
    health: 50.0,
    ...overwrite,
  }
  world.push(object)
  return object
}

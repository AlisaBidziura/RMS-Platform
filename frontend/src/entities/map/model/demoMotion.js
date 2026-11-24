import { demoPositions } from './demoMaps.js'

const SPEED = 1.2
const LEFT = 0
const RIGHT = 22

// Движение только по горизонтальному тестовому коридору, не навигация робота.
export function getDemoPositionsAt(elapsedSeconds, initialPositions = demoPositions) {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0
  const length = RIGHT - LEFT
  const initialById = new Map(initialPositions.map(position => [position.robotId, position]))
  return demoPositions.map(base => {
    const saved = initialById.get(base.robotId)
    const position = saved?.mapId === base.mapId && Number.isFinite(saved.x) && saved.x >= LEFT && saved.x <= RIGHT ? saved : base
    const offset = position.x - LEFT
    const start = Math.cos(position.heading) < 0 ? 2 * length - offset : offset
    const phase = (start + elapsed * SPEED) % (2 * length)
    const forward = phase < length
    return {
      ...position,
      x: LEFT + (forward ? phase : 2 * length - phase),
      heading: forward ? 0 : Math.PI,
    }
  })
}

// Демонстрация использует время кадров, а не частоту серверных сообщений.
export function startDemoFrameLoop(onElapsed, {
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
} = {}) {
  let active = true
  let frameId
  let previous = null
  let elapsed = 0

  function tick(now) {
    if (!active) return
    // После сворачивания вкладки не переносим робота скачком через всю карту.
    if (previous !== null) elapsed += Math.min(100, Math.max(0, now - previous))
    previous = now
    onElapsed(elapsed / 1000)
    if (active) frameId = requestFrame(tick)
  }

  frameId = requestFrame(tick)
  return () => {
    active = false
    cancelFrame(frameId)
  }
}

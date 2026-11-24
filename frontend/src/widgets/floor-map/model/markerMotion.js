export const MARKER_TRANSITION_MS = 400

// SVG использует градусы. При переходе через 180° выбираем короткий поворот.
export function shortestRotation(from, to) {
  return ((to - from + 180) % 360 + 360) % 360 - 180
}

export function interpolateMarker(from, to, progress) {
  const t = Math.max(0, Math.min(1, progress))
  if (t === 1) return to
  const rotation = Number.isFinite(from.rotation) && Number.isFinite(to.rotation)
    ? from.rotation + shortestRotation(from.rotation, to.rotation) * t
    : to.rotation
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    rotation,
  }
}

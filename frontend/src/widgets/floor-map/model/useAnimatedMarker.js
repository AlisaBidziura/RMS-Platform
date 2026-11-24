import { useEffect, useRef, useState } from 'react'
import { interpolateMarker, MARKER_TRANSITION_MS } from './markerMotion.js'

export function useAnimatedMarker(target, offline, immediatePosition = false) {
  // Кадровые демопозиции уже плавные; интерполируем только их поворот.
  const x = immediatePosition ? 0 : target.x
  const y = immediatePosition ? 0 : target.y
  const { rotation } = target
  const [marker, setMarker] = useState(() => ({ x, y, rotation }))
  const displayed = useRef(marker)

  useEffect(() => {
    const from = displayed.current
    const to = { x, y, rotation }
    if (from.x === x && from.y === y && from.rotation === rotation) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let start = null
    let frameId
    function animate(now) {
      start ??= now
      const progress = offline || reducedMotion ? 1 : Math.min(1, (now - start) / MARKER_TRANSITION_MS)
      const next = interpolateMarker(from, to, progress)
      displayed.current = next
      setMarker(next)
      if (progress < 1) frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [x, y, rotation, offline])

  return immediatePosition ? { ...target, rotation: marker.rotation } : marker
}

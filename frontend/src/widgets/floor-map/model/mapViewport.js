export const MIN_ZOOM = 1
export const MAX_ZOOM = 5
export const INITIAL_VIEW = Object.freeze({ x: 0, y: 0, zoom: MIN_ZOOM })

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function constrain(view, map) {
  return {
    zoom: view.zoom,
    x: clamp(view.x, 0, map.width * (1 - 1 / view.zoom)),
    y: clamp(view.y, 0, map.height * (1 - 1 / view.zoom)),
  }
}

// Координаты курсора относятся к исходному viewBox, а не к увеличенному изображению.
export function zoomAt(view, map, requestedZoom, anchor = { x: map.width / 2, y: map.height / 2 }) {
  if (!Number.isFinite(requestedZoom)) return view
  const zoom = clamp(requestedZoom, MIN_ZOOM, MAX_ZOOM)
  if (zoom === view.zoom) return view
  return constrain({
    zoom,
    x: view.x + anchor.x / view.zoom - anchor.x / zoom,
    y: view.y + anchor.y / view.zoom - anchor.y / zoom,
  }, map)
}

export function panBy(view, map, dx, dy) {
  return constrain({ ...view, x: view.x - dx / view.zoom, y: view.y - dy / view.zoom }, map)
}

export function getViewportFit(map, width, height) {
  const scale = Math.min(width / map.width, height / map.height)
  return { scale, left: (width - map.width * scale) / 2, top: (height - map.height * scale) / 2 }
}

export function clientToViewport(map, rect, clientX, clientY) {
  const { scale, left, top } = getViewportFit(map, rect.width, rect.height)
  if (!(scale > 0)) return null
  return {
    x: clamp((clientX - rect.left - left) / scale, 0, map.width),
    y: clamp((clientY - rect.top - top) / scale, 0, map.height),
  }
}

export function centerOn(view, map, point, minimumZoom = 2) {
  if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return view
  const zoom = clamp(Math.max(view.zoom, minimumZoom), MIN_ZOOM, MAX_ZOOM)
  return constrain({ zoom, x: point.x - map.width / (2 * zoom), y: point.y - map.height / (2 * zoom) }, map)
}

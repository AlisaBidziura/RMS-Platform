export function isValidMap(map) {
  return Boolean(map && typeof map.uid === 'string' && map.uid.length > 0 &&
    typeof map.imageUrl === 'string' && map.imageUrl.length > 0 &&
    Number.isInteger(map.width) && map.width > 0 &&
    Number.isInteger(map.height) && map.height > 0 &&
    Number.isFinite(map.originX) && Number.isFinite(map.originY) &&
    Number.isFinite(map.resolution) && map.resolution > 0)
}

function hasCoordinates(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y)
}

// Внутренний формат: метры, ось Y вверх, начало растра в левом нижнем углу.
// Адаптер RMS API должен привести полученные данные к этому формату.
export function worldToImage(map, position) {
  if (!isValidMap(map) || !hasCoordinates(position)) return null

  return {
    x: (position.x - map.originX) / map.resolution,
    y: map.height - (position.y - map.originY) / map.resolution,
  }
}

export function imageToWorld(map, point) {
  if (!isValidMap(map) || !hasCoordinates(point)) return null

  return {
    x: map.originX + point.x * map.resolution,
    y: map.originY + (map.height - point.y) * map.resolution,
  }
}

export function getMapMarker(map, position) {
  if (!position || position.mapId !== map?.uid) return null
  const point = worldToImage(map, position)
  if (!point || point.x < 0 || point.x > map.width || point.y < 0 || point.y > map.height) return null

  return {
    ...point,
    rotation: Number.isFinite(position.heading) ? -position.heading * 180 / Math.PI : null,
  }
}

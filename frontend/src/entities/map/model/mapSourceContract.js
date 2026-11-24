import { isValidMap, getMapMarker } from './coordinates.js'

export function validateMapCatalog(maps) {
  if (!Array.isArray(maps) || !maps.every(map => isValidMap(map) &&
    typeof map.name === 'string' && map.name.trim() !== '' &&
    (typeof map.floor === 'string' && map.floor.trim() !== '' || Number.isInteger(map.floor)))) {
    throw new Error('Некорректный каталог карт')
  }
  if (new Set(maps.map(map => map.uid)).size !== maps.length) {
    throw new Error('Повторяющиеся идентификаторы карт')
  }
  return maps
}

// Снимок содержит не более одной позиции каждого робота. Ошибочные записи не рисуем.
export function normalizePositionSnapshot(positions, maps) {
  if (!Array.isArray(positions)) throw new Error('Некорректный снимок координат')
  const mapsById = new Map(maps.map(map => [map.uid, map]))
  const unique = new Map()
  const seen = new Set()
  for (const position of positions) {
    if (typeof position?.robotId !== 'string' || !position.robotId.trim()) continue
    if (seen.has(position.robotId)) {
      unique.delete(position.robotId)
      continue
    }
    seen.add(position.robotId)
    const map = mapsById.get(position.mapId)
    if (!map || !getMapMarker(map, position)) continue
    if (map.version != null && position.mapVersion != null && map.version !== position.mapVersion) continue
    unique.set(position.robotId, { ...position, heading: Number.isFinite(position.heading) ? position.heading : null })
  }
  return [...unique.values()]
}

export async function loadMapCatalog(source, signal) {
  return validateMapCatalog(await source.getMaps({ signal }))
}

export async function loadPositionSnapshot(source, maps, signal) {
  return normalizePositionSnapshot(await source.getPositions({ signal }), maps)
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidMap, worldToImage, imageToWorld, getMapMarker } from '../../src/entities/map/model/coordinates.js'
import { demoMaps, demoPositions } from '../../src/entities/map/model/demoMaps.js'
import { demoMapSource } from '../../src/entities/map/api/demoMapSource.js'

const map = demoMaps[0]

test('начало мировых координат соответствует нижнему левому углу растра', () => {
  assert.deepEqual(worldToImage(map, { x: -10, y: -8 }), { x: 0, y: 500 })
})

test('верхний правый угол растра', () => {
  assert.deepEqual(worldToImage(map, { x: 30, y: 17 }), { x: 800, y: 0 })
})

test('преобразование координат обратимо', () => {
  const position = { x: 2, y: 4.5 }
  assert.deepEqual(imageToWorld(map, worldToImage(map, position)), position)
})

test('некорректный масштаб или координаты не создают маркер', () => {
  assert.equal(isValidMap({ ...map, resolution: 0 }), false)
  assert.equal(worldToImage({ ...map, resolution: 0 }, { x: 2, y: 2 }), null)
  assert.equal(worldToImage(map, { x: NaN, y: 0 }), null)
  assert.equal(imageToWorld(map, null), null)
})

test('позиция другого этажа или за пределами изображения скрывается', () => {
  assert.equal(getMapMarker(map, { mapId: 'demo-floor-2', x: 2, y: 3 }), null)
  assert.equal(getMapMarker(map, { mapId: map.uid, x: 200, y: 0 }), null)
  assert.equal(getMapMarker(map, null), null)
})

test('отсутствующее направление не заменяется выдуманным углом', () => {
  assert.equal(getMapMarker(map, { mapId: map.uid, x: 2, y: 4.5 }).rotation, null)
  assert.equal(getMapMarker(map, { mapId: map.uid, x: 2, y: 4.5, heading: Math.PI / 2 }).rotation, -90)
})

test('демокарты уникальны и все тестовые позиции находятся на своих картах', () => {
  assert.equal(new Set(demoMaps.map(item => item.uid)).size, 3)
  for (const position of demoPositions) {
    const item = demoMaps.find(candidate => candidate.uid === position.mapId)
    assert.ok(isValidMap(item))
    assert.ok(getMapMarker(item, position))
  }
})

test('источник возвращает отдельные снимки карт и позиций', async () => {
  const maps = await demoMapSource.getMaps()
  const positions = await demoMapSource.getPositions()
  assert.equal(demoMapSource.mode, 'demo')
  assert.equal(maps.length, 3)
  assert.equal(maps[0].robotPositions, undefined)
  maps[0].name = 'Изменено'
  positions[0].x = 999
  assert.notEqual((await demoMapSource.getMaps())[0].name, 'Изменено')
  assert.notEqual((await demoMapSource.getPositions())[0].x, 999)
})

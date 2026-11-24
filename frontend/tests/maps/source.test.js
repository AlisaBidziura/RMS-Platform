import test from 'node:test'
import assert from 'node:assert/strict'
import { loadMapCatalog, loadPositionSnapshot, normalizePositionSnapshot, validateMapCatalog } from '../../src/entities/map/model/mapSourceContract.js'
import { demoMaps, demoPositions } from '../../src/entities/map/model/demoMaps.js'

const map = demoMaps[0]
const pose = demoPositions[0]

test('каталог допускает пустой список и числовой этаж', () => {
  assert.deepEqual(validateMapCatalog([]), [])
  assert.equal(validateMapCatalog([{ ...map, floor: 1 }]).length, 1)
  assert.throws(() => validateMapCatalog([{ ...map, name: '' }]))
  assert.throws(() => validateMapCatalog([{ ...map, floor: null }]))
})
test('повтор идентификатора карты не допускается', () => {
  assert.throws(() => validateMapCatalog([map, { ...map }]))
})
test('ошибочные и неизвестные позиции не рисуются, отсутствующий угол не подменяется', () => {
  const positions = normalizePositionSnapshot([
    { ...pose, heading: undefined },
    { ...pose, robotId: 'bad-x', x: Infinity },
    { ...pose, robotId: 'bad-map', mapId: 'unknown' },
    { ...pose, robotId: 'out', y: 1000 },
    { ...pose, robotId: '' }, null,
  ], demoMaps)
  assert.deepEqual(positions, [{ ...pose, heading: null }])
})
test('две позиции одного робота исключаются как неоднозначные', () => {
  assert.deepEqual(normalizePositionSnapshot([pose, { ...pose, x: 3 }], demoMaps), [])
})
test('координаты несовпадающей версии карты исключаются', () => {
  assert.deepEqual(normalizePositionSnapshot([{ ...pose, mapVersion: 2 }], [{ ...map, version: 1 }]), [])
  assert.equal(normalizePositionSnapshot([{ ...pose, mapVersion: 1 }], [{ ...map, version: 1 }]).length, 1)
})
test('некорректный формат снимка не считается пустым снимком', () => {
  assert.throws(() => normalizePositionSnapshot({}, demoMaps))
  assert.deepEqual(normalizePositionSnapshot([], demoMaps), [])
})
test('каталог загружается отдельно от недоступной телеметрии, сигнал передаётся источнику', async () => {
  const { signal } = new AbortController()
  const source = {
    getMaps(options) { assert.equal(options.signal, signal); return Promise.resolve([map]) },
    getPositions(options) { assert.equal(options.signal, signal); return Promise.reject(new Error('offline')) },
  }
  const catalog = await loadMapCatalog(source, signal)
  assert.deepEqual(catalog, [map])
  await assert.rejects(loadPositionSnapshot(source, catalog, signal), /offline/)
})

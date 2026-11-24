import test from 'node:test'
import assert from 'node:assert/strict'
import { getDemoPositionsAt, startDemoFrameLoop } from '../../src/entities/map/model/demoMotion.js'
import { demoMaps, demoPositions } from '../../src/entities/map/model/demoMaps.js'
import { getMapMarker } from '../../src/entities/map/model/coordinates.js'
import { mergePositionSnapshot } from '../../src/entities/map/model/positionSnapshot.js'
import { interpolateMarker, shortestRotation } from '../../src/widgets/floor-map/model/markerMotion.js'
import { centerOn, INITIAL_VIEW } from '../../src/widgets/floor-map/model/mapViewport.js'

test('демодвижение начинается с исходных позиций и сохраняет идентификаторы', () => {
  assert.deepEqual(getDemoPositionsAt(0), demoPositions)
  assert.equal(getDemoPositionsAt(1)[0].x, 3.2)
  assert.ok(getDemoPositionsAt(1)[1].x < demoPositions[1].x)
})

test('демороботы остаются на своих картах и разворачиваются на концах коридора', () => {
  for (let t = 0; t <= 100; t += .5) {
    for (const position of getDemoPositionsAt(t)) {
      assert.ok(position.x >= 0 && position.x <= 22)
      assert.equal(position.y, 4.5)
      assert.ok(getMapMarker(demoMaps.find(map => map.uid === position.mapId), position))
    }
  }
  assert.equal(getDemoPositionsAt(20)[0].heading, Math.PI)
})

test('интерполяция позиции и короткий поворот через границу углов', () => {
  const from = { x: 0, y: 10, rotation: 170 }
  const to = { x: 10, y: 20, rotation: -170 }
  assert.equal(shortestRotation(170, -170), 20)
  assert.equal(shortestRotation(-170, 170), -20)
  assert.deepEqual(interpolateMarker(from, to, .5), { x: 5, y: 15, rotation: 180 })
  assert.deepEqual(interpolateMarker(from, to, 1), to)
})

test('отсутствующий угол не придумывается при анимации', () => {
  assert.equal(interpolateMarker({ x: 0, y: 0, rotation: 90 }, { x: 1, y: 1, rotation: null }, .5).rotation, null)
})

test('демопозиция робота вне сети сохраняется при обновлении снимка', () => {
  const before = getDemoPositionsAt(0)
  const after = getDemoPositionsAt(1)
  const merged = mergePositionSnapshot(before, after, [{ id: 'R-002', status: 'offline' }])
  assert.deepEqual(merged.find(p => p.robotId === 'R-002'), before[0])
  assert.deepEqual(merged.find(p => p.robotId === 'R-003'), after[1])
})

test('нет выдуманной позиции для робота вне сети без предыдущего снимка', () => {
  assert.deepEqual(mergePositionSnapshot([], [demoPositions[0]], [{ id: 'R-002', status: 'offline' }]), [])
  assert.deepEqual(mergePositionSnapshot([demoPositions[0]], [], [{ id: 'R-002', status: 'available' }]), [])
})

test('центрирование приближает карту и ограничивает положение камеры', () => {
  const map = { width: 800, height: 500 }
  assert.deepEqual(centerOn(INITIAL_VIEW, map, { x: 400, y: 250 }), { x: 200, y: 125, zoom: 2 })
  assert.deepEqual(centerOn(INITIAL_VIEW, map, { x: 800, y: 500 }), { x: 400, y: 250, zoom: 2 })
  assert.deepEqual(centerOn({ x: 10, y: 10, zoom: 4 }, map, { x: 0, y: 0 }), { x: 0, y: 0, zoom: 4 })
  assert.equal(centerOn(INITIAL_VIEW, map, null), INITIAL_VIEW)
})

test('повторный запуск продолжает движение с последней демонстрационной позиции', () => {
  const paused = getDemoPositionsAt(6)
  for (const [index, position] of getDemoPositionsAt(0, paused).entries()) {
    assert.ok(Math.abs(position.x - paused[index].x) < 1e-9)
    assert.equal(position.heading, paused[index].heading)
  }
  const continued = getDemoPositionsAt(2, paused)
  for (let i = 0; i < continued.length; i++) {
    assert.ok(Math.abs(continued[i].x - getDemoPositionsAt(8)[i].x) < 1e-9)
    assert.equal(continued[i].heading, getDemoPositionsAt(8)[i].heading)
  }
})

function fakeFrames() {
  let nextId = 0
  const queue = new Map()
  return {
    requestFrame(callback) { queue.set(++nextId, callback); return nextId },
    cancelFrame(id) { queue.delete(id) },
    step(now) {
      const batch = [...queue.values()]
      queue.clear()
      for (const callback of batch) callback(now)
    },
    pending() { return queue.size },
  }
}

test('демодвижение обновляется каждый кадр без пауз между снимками', () => {
  const clock = fakeFrames()
  const positions = []
  const stop = startDemoFrameLoop(t => positions.push(getDemoPositionsAt(t)[0].x), clock)
  for (let frame = 0; frame <= 60; frame++) clock.step(frame * 1000 / 60)
  assert.equal(positions.length, 61)
  for (let i = 1; i < positions.length; i++) {
    assert.ok(Math.abs(positions[i] - positions[i - 1] - .02) < 1e-9)
  }
  stop()
  assert.equal(clock.pending(), 0)
  clock.step(2000)
  assert.equal(positions.length, 61)
})

test('долгая пауза между кадрами не вызывает скачок деморобота', () => {
  const clock = fakeFrames()
  const times = []
  const stop = startDemoFrameLoop(t => times.push(t), clock)
  clock.step(100)
  clock.step(116)
  clock.step(10116)
  assert.deepEqual(times, [0, .016, .116])
  stop()
})

test('остановка внутри кадра не планирует следующий кадр', () => {
  const clock = fakeFrames()
  const stop = startDemoFrameLoop(() => stop(), clock)
  clock.step(100)
  assert.equal(clock.pending(), 0)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_VIEW, MAX_ZOOM, zoomAt, panBy, getViewportFit, clientToViewport } from '../../src/widgets/floor-map/model/mapViewport.js'

const map = { width: 800, height: 500 }

test('увеличение сохраняет мировую точку под курсором', () => {
  const anchor = { x: 240, y: 180 }
  const view = zoomAt(INITIAL_VIEW, map, 2, anchor)
  assert.deepEqual(view, { x: 120, y: 90, zoom: 2 })
  const next = zoomAt(view, map, 4, anchor)
  assert.equal(next.x + anchor.x / next.zoom, view.x + anchor.x / view.zoom)
  assert.equal(next.y + anchor.y / next.zoom, view.y + anchor.y / view.zoom)
})

test('масштаб ограничен диапазоном и сбрасывается к полному плану', () => {
  const view = zoomAt(INITIAL_VIEW, map, 99)
  assert.equal(view.zoom, MAX_ZOOM)
  assert.deepEqual(zoomAt(view, map, 0.1), INITIAL_VIEW)
  assert.equal(zoomAt(view, map, NaN), view)
})

test('перетаскивание учитывает масштаб и направление', () => {
  const view = { x: 200, y: 125, zoom: 2 }
  assert.deepEqual(panBy(view, map, 100, -50), { x: 150, y: 150, zoom: 2 })
})

test('перетаскивание не выводит план за границы', () => {
  const view = { x: 200, y: 125, zoom: 2 }
  assert.deepEqual(panBy(view, map, -9999, -9999), { x: 400, y: 250, zoom: 2 })
  assert.deepEqual(panBy(view, map, 9999, 9999), { x: 0, y: 0, zoom: 2 })
  assert.deepEqual(panBy(INITIAL_VIEW, map, 100, 100), INITIAL_VIEW)
})

test('широкий контейнер учитывает горизонтальные поля SVG', () => {
  const rect = { left: 100, top: 50, width: 1000, height: 500 }
  assert.deepEqual(getViewportFit(map, rect.width, rect.height), { scale: 1, left: 100, top: 0 })
  assert.deepEqual(clientToViewport(map, rect, 600, 300), { x: 400, y: 250 })
  assert.deepEqual(clientToViewport(map, rect, 100, 50), { x: 0, y: 0 })
})

test('узкий контейнер учитывает вертикальные поля SVG', () => {
  const rect = { left: 20, top: 30, width: 400, height: 400 }
  assert.deepEqual(getViewportFit(map, rect.width, rect.height), { scale: 0.5, left: 0, top: 75 })
  assert.deepEqual(clientToViewport(map, rect, 220, 230), { x: 400, y: 250 })
  assert.equal(clientToViewport(map, { ...rect, width: 0 }, 0, 0), null)
})

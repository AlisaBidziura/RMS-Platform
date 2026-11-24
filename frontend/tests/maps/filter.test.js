import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterMapRobots } from '../../src/pages/maps/model/mapRobotFilter.js'

const robots = [
  { id: 'R-001', name: 'Доставка', model: 'AX-1', status: 'working' },
  { id: 'R-002', name: 'Уборка', status: 'available' },
  { id: 'R-003', name: 'Доставка 2', status: 'offline' },
]

test('поиск учитывает регистр, пробелы, имя, ID и модель', () => {
  assert.deepEqual(filterMapRobots(robots, ' ДОСТАВКА ').map(r => r.id), ['R-001', 'R-003'])
  assert.deepEqual(filterMapRobots(robots, 'r-002').map(r => r.id), ['R-002'])
  assert.deepEqual(filterMapRobots(robots, 'ax-1').map(r => r.id), ['R-001'])
})
test('поиск и фильтр статуса применяются вместе', () => {
  assert.deepEqual(filterMapRobots(robots, 'доставка', 'offline').map(r => r.id), ['R-003'])
  assert.deepEqual(filterMapRobots(robots, 'уборка', 'offline'), [])
})
test('пустой поиск показывает всех и не изменяет исходный список', () => {
  assert.deepEqual(filterMapRobots(robots, ' '), robots)
  assert.equal(robots.length, 3)
  assert.deepEqual(filterMapRobots([], 'r'), [])
})

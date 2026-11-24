// Не подменяем последнюю известную позицию робота вне сети новым демоснимком.
// Для активного робота отсутствие координат в полном снимке означает отсутствие маркера.
export function mergePositionSnapshot(previous, next, robots) {
  const offline = new Set(robots.filter(robot => robot.status === 'offline').map(robot => robot.id))
  const result = new Map(next.filter(position => position?.robotId).map(position => [position.robotId, position]))
  for (const position of previous) {
    if (position?.robotId && offline.has(position.robotId)) {
      result.set(position.robotId, position)
    }
  }
  // Если робот уже был вне сети, а предыдущей позиции нет, не создаём её из демоснимка.
  const known = new Set(previous.filter(position => position?.robotId).map(position => position.robotId))
  for (const robotId of offline) {
    if (!known.has(robotId)) result.delete(robotId)
  }
  return [...result.values()]
}

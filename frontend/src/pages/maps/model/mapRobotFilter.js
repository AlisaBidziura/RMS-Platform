export function filterMapRobots(robots, query = '', status = 'all') {
  const search = query.trim().toLocaleLowerCase('ru')
  return robots.filter(robot => (status === 'all' || robot.status === status) &&
    (!search || [robot.name, robot.id, robot.model].some(value =>
      String(value ?? '').toLocaleLowerCase('ru').includes(search))))
}

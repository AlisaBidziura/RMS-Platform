const createDemoMap = (floor, imageUrl) => ({
  uid: `demo-floor-${floor}`,
  name: `Этаж ${floor}`,
  floor,
  imageUrl,
  width: 800,
  height: 500,
  originX: -10,
  originY: -8,
  resolution: 0.05,
})

export const demoMaps = [
  createDemoMap('1', new URL('../assets/floor-1.png', import.meta.url).href),
  createDemoMap('2', new URL('../assets/floor-2.png', import.meta.url).href),
  createDemoMap('3', new URL('../assets/floor-3.png', import.meta.url).href),
]

// Тестовые позиции изолированы от метаданных карт и телеметрии RMS.
export const demoPositions = [
  { robotId: 'R-002', mapId: 'demo-floor-1', x: 2, y: 4.5, heading: 0 },
  { robotId: 'R-003', mapId: 'demo-floor-1', x: 21, y: 4.5, heading: Math.PI },
  { robotId: 'R-001', mapId: 'demo-floor-2', x: 1, y: 4.5, heading: 0 },
  { robotId: 'R-005', mapId: 'demo-floor-2', x: 20, y: 4.5, heading: Math.PI },
  { robotId: 'R-004', mapId: 'demo-floor-3', x: 11, y: 4.5, heading: 0 },
]

import { demoMaps, demoPositions } from '../model/demoMaps.js'

// Контракт источника данных: getMaps() и getPositions() возвращают Promise с массивом.
// Будущий источник RMS реализует тот же интерфейс, не меняя компоненты карты.
export const demoMapSource = {
  mode: 'demo',
  async getMaps() {
    return demoMaps.map(map => ({ ...map }))
  },
  async getPositions() {
    return demoPositions.map(position => ({ ...position }))
  },
}

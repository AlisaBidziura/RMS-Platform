import { demoMaps, demoPositions } from '../model/demoMaps.js'
import { getDemoPositionsAt, startDemoFrameLoop } from '../model/demoMotion.js'

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
  subscribePositions(listener, { signal, initialPositions } = {}) {
    if (signal?.aborted) return () => {}
    const stopFrames = startDemoFrameLoop(elapsed => {
      listener(getDemoPositionsAt(elapsed, initialPositions))
    })
    function stop() {
      stopFrames()
      signal?.removeEventListener('abort', stop)
    }
    signal?.addEventListener('abort', stop, { once: true })
    return stop
  },
}

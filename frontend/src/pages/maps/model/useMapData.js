import { useEffect, useState } from 'react'
import { isValidMap } from '../../../entities/map/index.js'

export function useMapData(source) {
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState({ status: 'loading', maps: [], positions: [], error: '' })

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => Promise.all([
      source.getMaps({ signal: controller.signal }),
      source.getPositions({ signal: controller.signal }),
    ])).then(([maps, positions]) => {
      if (controller.signal.aborted) return
      if (!Array.isArray(maps) || !maps.every(isValidMap) || !Array.isArray(positions)) {
        throw new Error('Некорректный формат данных карты')
      }
      if (new Set(maps.map(map => map.uid)).size !== maps.length) {
        throw new Error('Повторяющиеся идентификаторы карт')
      }
      setResult({ status: 'ready', maps, positions, error: '' })
    }).catch(() => {
      if (!controller.signal.aborted) {
        setResult({ status: 'error', maps: [], positions: [], error: 'Не удалось получить данные карты.' })
      }
    })
    // При смене источника или закрытии страницы не принимаем устаревший ответ.
    return () => controller.abort()
  }, [source, requestId])

  function retry() {
    setResult({ status: 'loading', maps: [], positions: [], error: '' })
    setRequestId(id => id + 1)
  }

  return { ...result, retry }
}

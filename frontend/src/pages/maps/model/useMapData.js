import { useEffect, useRef, useState } from 'react'
import { isValidMap, mergePositionSnapshot } from '../../../entities/map/index.js'

export function useMapData(source, robots, motionEnabled) {
  const robotsRef = useRef(robots)
  useEffect(() => { robotsRef.current = robots }, [robots])
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

  const positionsRef = useRef(result.positions)
  useEffect(() => { positionsRef.current = result.positions }, [result.positions])

  useEffect(() => {
    if (result.status !== 'ready' || (source.mode === 'demo' && !motionEnabled) || !source.subscribePositions) return
    const controller = new AbortController()
    const unsubscribe = source.subscribePositions(positions => {
      if (controller.signal.aborted || !Array.isArray(positions)) return
      const currentRobots = robotsRef.current
      setResult(current => ({ ...current, positions: source.mode === 'demo' ? mergePositionSnapshot(current.positions, positions, currentRobots) : positions }))
    }, { signal: controller.signal, initialPositions: positionsRef.current })
    return () => {
      controller.abort()
      unsubscribe?.()
    }
  }, [source, result.status, motionEnabled])

  function retry() {
    setResult({ status: 'loading', maps: [], positions: [], error: '' })
    setRequestId(id => id + 1)
  }

  return { ...result, retry }
}

import { useEffect, useRef, useState } from 'react'
import { loadMapCatalog, loadPositionSnapshot, normalizePositionSnapshot, mergePositionSnapshot } from '../../../entities/map/index.js'

const initialResult = { status: 'loading', maps: [], positions: [], error: '', positionStatus: 'loading' }

export function useMapData(source, robots, motionEnabled) {
  const robotsRef = useRef(robots)
  useEffect(() => { robotsRef.current = robots }, [robots])
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState(initialResult)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    async function load() {
      let maps
      try {
        maps = await loadMapCatalog(source, signal)
      } catch {
        if (!signal.aborted) setResult({ ...initialResult, status: 'error', error: 'Не удалось получить данные карты.' })
        return
      }
      if (signal.aborted) return
      setResult({ ...initialResult, status: 'ready', maps, positionStatus: maps.length ? 'loading' : 'ready' })
      if (!maps.length) return
      try {
        const positions = await loadPositionSnapshot(source, maps, signal)
        if (!signal.aborted) setResult(current => ({ ...current, positions, positionStatus: 'ready' }))
      } catch {
        // Недоступная телеметрия не мешает просмотру уже полученного плана.
        if (!signal.aborted) setResult(current => ({ ...current, positionStatus: 'error' }))
      }
    }
    load()
    return () => controller.abort()
  }, [source, requestId])

  const positionsRef = useRef(result.positions)
  useEffect(() => { positionsRef.current = result.positions }, [result.positions])
  const canSubscribe = result.status === 'ready' && result.positionStatus !== 'loading' && result.maps.length > 0

  useEffect(() => {
    if (!canSubscribe || (source.mode === 'demo' && !motionEnabled) || !source.subscribePositions) return
    const controller = new AbortController()
    const { signal } = controller
    function onError() {
      if (!signal.aborted) setResult(current => ({ ...current, positionStatus: 'error' }))
    }
    let unsubscribe
    try {
      unsubscribe = source.subscribePositions(positions => {
        if (signal.aborted) return
        try {
          const snapshot = normalizePositionSnapshot(positions, result.maps)
          const currentRobots = robotsRef.current
          setResult(current => ({ ...current, positionStatus: 'ready', positions: source.mode === 'demo' ? mergePositionSnapshot(current.positions, snapshot, currentRobots) : snapshot }))
        } catch {
          onError()
        }
      }, { signal, initialPositions: positionsRef.current, onError })
    } catch {
      onError()
    }
    return () => {
      controller.abort()
      unsubscribe?.()
    }
  }, [source, canSubscribe, result.maps, motionEnabled, requestId])

  function retry() {
    setResult(initialResult)
    setRequestId(id => id + 1)
  }

  return { ...result, retry }
}

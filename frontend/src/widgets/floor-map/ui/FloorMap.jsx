import { useEffect, useId, useRef, useState } from 'react'
import { Minus, Plus, Maximize } from 'lucide-react'
import { INITIAL_VIEW, MIN_ZOOM, MAX_ZOOM, clientToViewport, getViewportFit, panBy, zoomAt } from '../model/mapViewport.js'
import { getMapMarker } from '../../../entities/map/index.js'

const statusColors = {
  working: '#4264d2',
  available: '#15845d',
  charging: '#b7791f',
  warning: '#c24141',
  offline: '#64748b',
}

export function FloorMap({ map, robots, positions, selectedId, onSelect, isDemo = false }) {
  const [failedImage, setFailedImage] = useState(false)
  const [view, setView] = useState(INITIAL_VIEW)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const clipId = useId()
  const { width, height } = map

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const dimensions = { width, height }
    // Колесо над картой управляет масштабом, а не прокруткой страницы.
    function handleWheel(event) {
      if (event.ctrlKey || event.metaKey) return
      const anchor = clientToViewport(dimensions, svg.getBoundingClientRect(), event.clientX, event.clientY)
      if (!anchor) return
      event.preventDefault()
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1)
      const factor = Math.exp(-Math.max(-300, Math.min(300, delta)) * 0.002)
      setView(current => zoomAt(current, dimensions, current.zoom * factor, anchor))
    }
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [width, height, failedImage])

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || view.zoom <= MIN_ZOOM || event.target.closest('.floor-map-marker')) return
    const svg = event.currentTarget
    const { scale } = getViewportFit(map, svg.clientWidth, svg.clientHeight)
    if (!(scale > 0)) return
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, scale }
    svg.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    const dx = (event.clientX - drag.x) / drag.scale
    const dy = (event.clientY - drag.y) / drag.scale
    drag.x = event.clientX
    drag.y = event.clientY
    setView(current => panBy(current, map, dx, dy))
  }

  function finishDrag(event) {
    if (dragRef.current?.id !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
  }

  function changeZoom(factor) {
    setView(current => zoomAt(current, map, current.zoom * factor))
  }

  function resetView() {
    setView(INITIAL_VIEW)
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return
    const offsets = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }
    if (offsets[event.key]) {
      event.preventDefault()
      const [dx, dy] = offsets[event.key]
      setView(current => panBy(current, map, dx, dy))
    } else if (['+', '=', '-', '0', 'Home'].includes(event.key)) {
      event.preventDefault()
      if (event.key === '0' || event.key === 'Home') resetView()
      else changeZoom(event.key === '-' ? 1 / 1.25 : 1.25)
    }
  }

  if (failedImage) {
    return <div className="floor-map floor-map-message" role="alert">Не удалось загрузить изображение карты.</div>
  }

  return (
    <div className="floor-map">
      <svg ref={svgRef} className={`floor-map-image${dragging ? ' is-dragging' : view.zoom > MIN_ZOOM ? ' can-pan' : ''}`}
        viewBox={`0 0 ${width} ${height}`} aria-label={`${map.name}. Плюс и минус — масштаб, стрелки — перемещение, Home — сброс.`}
        tabIndex={0} onKeyDown={handleKeyDown} onPointerDown={startDrag} onPointerMove={moveDrag}
        onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
        <defs><clipPath id={clipId}><rect width={width} height={height} /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>
          <g transform={`scale(${view.zoom}) translate(${-view.x} ${-view.y})`}>
            <image href={map.imageUrl} width={map.width} height={map.height} onError={() => setFailedImage(true)} />
            {robots.map(robot => {
              const marker = getMapMarker(map, positions.get(robot.id))
              if (!marker) return null
              const active = robot.id === selectedId
              const label = isDemo ? `${robot.name}, демонстрационная позиция` : robot.name
    
              return (
                <g key={robot.id} className="floor-map-marker" transform={`translate(${marker.x} ${marker.y}) scale(${1 / view.zoom})`}
                  role="button" tabIndex={0} aria-label={label}
                  aria-pressed={active} onClick={() => onSelect(robot.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(robot.id)
                    }
                  }}>
                  <title>{label}</title>
                  {active && <circle r="22" fill="none" stroke="#7895ef" strokeWidth="3" />}
                  <circle r="16" fill={statusColors[robot.status] || statusColors.offline} stroke="white" strokeWidth="2" />
                  {marker.rotation === null ? <circle r="4" fill="white" /> : (
                    <path d="M -6 -7 L 10 0 L -6 7 L -2 0 Z" fill="white" transform={`rotate(${marker.rotation})`} />
                  )}
                  <rect x="-30" y="22" width="60" height="21" rx="5" fill="#334056" />
                  <text y="36" fill="white" fontSize="12" textAnchor="middle">{robot.id}</text>
                </g>
              )
            })}
          </g>
        </g>
      </svg>
      <div className="floor-map-controls" role="group" aria-label="Управление масштабом карты">
        <button type="button" title="Приблизить" aria-label="Приблизить" onClick={() => changeZoom(1.25)} disabled={view.zoom >= MAX_ZOOM}><Plus size={18} /></button>
        <button type="button" title="Отдалить" aria-label="Отдалить" onClick={() => changeZoom(1 / 1.25)} disabled={view.zoom <= MIN_ZOOM}><Minus size={18} /></button>
        <button type="button" title="Вписать карту" aria-label="Вписать карту" onClick={resetView}><Maximize size={16} /></button>
        <output className="floor-map-zoom" aria-label="Текущий масштаб">{Math.round(view.zoom * 100)}%</output>
      </div>
      <div className="floor-map-hint">Колесо — масштаб · перетаскивание — перемещение</div>
    </div>
  )
}

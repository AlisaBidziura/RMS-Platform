import { useState } from 'react'
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

  if (failedImage) {
    return <div className="floor-map floor-map-message" role="alert">Не удалось загрузить изображение карты.</div>
  }

  return (
    <div className="floor-map">
      <svg className="floor-map-image" viewBox={`0 0 ${map.width} ${map.height}`} aria-label={map.name}>
        <image href={map.imageUrl} width={map.width} height={map.height} onError={() => setFailedImage(true)} />
        {robots.map(robot => {
          const marker = getMapMarker(map, positions.get(robot.id))
          if (!marker) return null
          const active = robot.id === selectedId
          const label = isDemo ? `${robot.name}, демонстрационная позиция` : robot.name

          return (
            <g key={robot.id} className="floor-map-marker" transform={`translate(${marker.x} ${marker.y})`}
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
      </svg>
    </div>
  )
}

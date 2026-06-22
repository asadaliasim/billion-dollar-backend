function parseCoord(coord) {
  if (!coord || typeof coord !== 'string') return null
  const match = coord.match(/\((\d+),\s*(\d+)\)/)
  if (!match) return null
  return { x: parseInt(match[1], 10), y: parseInt(match[2], 10) }
}

function toBounds(startCoord, endCoord) {
  const start = parseCoord(startCoord)
  const end = parseCoord(endCoord)
  if (!start || !end) return null

  return {
    minX: Math.min(start.x, end.x),
    maxX: Math.max(start.x, end.x),
    minY: Math.min(start.y, end.y),
    maxY: Math.max(start.y, end.y)
  }
}

function rectsOverlap(a, b) {
  if (!a || !b) return false
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  )
}

function blockCountFromCoords(startCoord, endCoord) {
  const bounds = toBounds(startCoord, endCoord)
  if (!bounds) return 0
  return (bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1)
}

module.exports = {
  parseCoord,
  toBounds,
  rectsOverlap,
  blockCountFromCoords
}

let frametimes: number[] = []

export const updateFpsDisplay = (deltaTime: number) => {
  frametimes.push(deltaTime)
  if (frametimes.length > 60) {
    frametimes.splice(0, 1)
  }

  let maxFrametime = 0.0
  for (const ft of frametimes) {
    if (ft > maxFrametime) {
      maxFrametime = ft
    }
  }

  const fpselement = document.querySelector('#fpsdisplay')
  if (fpselement) fpselement.innerHTML = (1 / maxFrametime).toFixed(2) + ' FPS'
  const frametimeelement = document.querySelector('#frametimedisplay')
  if (frametimeelement)
    frametimeelement.innerHTML = (1000 * maxFrametime).toFixed(2) + ' ms'
}

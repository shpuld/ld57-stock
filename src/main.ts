import { setupCanvas } from './webgl.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas class="relative block m-2 min-w-0 border-red-600 border-1 flex-grow" id="canvas"></canvas>
  <div class="absolute m-4 py-1 px-2 bg-[rgba(0,0,0,0.5)] rounded-sm">
    <div id="fpsdisplay">60FPS</div>
    <div id="frametimedisplay">16.67ms</div>
  </div>
`

setupCanvas(document.querySelector<HTMLCanvasElement>('#canvas'))

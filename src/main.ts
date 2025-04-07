const sharedButtonStyles =
  'flex-grow m-4 font-bold p-6 rounded-md shadow-2xl border-4 grayscale-0 disabled:grayscale-100 transition-[filter] duration-300 hover:brightness-125 disabled:hover:brightness-100'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="root" class="relative w-full h-full flex flex-col justify-between bg-gradient-green">
  <div id="gradientRed" class="absolute inset-0 bg-gradient-red"></div>
  <img id="wallpaper" class="absolute bottom-0 mix-blend-multiply opacity-30 max-h-full w-full object-contain" src="/frog3.jpg">
  <div class="flex flex-row justify-between text-2xl z-10">
    <div class="w-full flex flex-row justify-between py-1 px-4 bg-[rgba(0,0,0,0.5)] text-green-300 opacity-50">
      <div class="flex flex-col items-center flex-1/3">
        <span class="text-xs">FUNDS</span>
        <span id="funds"></span>
      </div>
      <div class="flex flex-col items-center flex-1/3">
        <span class="text-xs">SHARES</span>
        <span id="stocksOwned"></span>
      </div>
      <div class="flex flex-col items-center flex-1/3">
        <span class="text-xs">PORTFOLIO VALUE</span>
        <span id="portfolioValue"></span>
      </div>
    </div>
  </div>
  <div class="flex-grow relative">
    <div id="log" class="absolute top-1 left-2 font-mono text-sm">
    </div>
    <div id="currentValue" class="absolute w-full h-px opacity-20 bg-cyan-600 transition-transform duration-75"></div>
    <div class="absolute w-full bottom-16 flex flex-col items-center">
      <span id="stockPrice" class="text-8xl current-price"></span>
      <span id="dailyChange" class="text-2xl change-down transition-colors duration-150">-0.00 (0.00%)</span>
    </div>
    <span id="ceilMarker" class="absolute right-2 top-0 opacity-30 text-lg text-green-300">$1200</span>
    <span id="floorMarker" class="absolute right-2 bottom-0 opacity-30 text-lg text-green-300">$600</span>
    <div id="barGraph" class="w-full h-full" ></div>
  </div>
  <div class="flex flex-row w-full text-4xl">
    <button id="sell" disabled class="${sharedButtonStyles} text-rose-200 disabled:text-rose-400 bg-rose-700/70 border-t-rose-500/70 border-l-rose-600/70 border-r-rose-800/70 border-b-rose-900/70">SELL</button>
    <button id="buy" class="${sharedButtonStyles} text-emerald-200 disabled:text-emerald-400 bg-emerald-600/70 border-t-emerald-400/70 border-l-emerald-500/70 border-r-emerald-700/70 border-b-emerald-800/70">BUY</button>
  </div>
  <div id="startBackground" class="absolute w-full h-full bg-black/70 flex justify-center items-center text-4xl z-10">
    <button id="startGame" class="${sharedButtonStyles} max-w-80 text-emerald-200 disabled:text-emerald-400 bg-emerald-600 border-t-emerald-400 border-l-emerald-500 border-r-emerald-700 border-b-emerald-800">START</button>
  </div>
  <div id="effects" class="absolute w-full-h-full">
  </div>
</div>
`

let stockPrice = 1000
let stocksOwned = 0
let funds = 10000

const portfolioValue = () => {
  return stocksOwned * stockPrice
}

const exchangeStock = (
  amount: number,
  target: EventTarget | HTMLElement | null,
  forced = false,
) => {
  // Buy
  if (amount > 0) {
    if (funds < stockPrice) {
      return
    }
    addLog('BUY', stockPrice)
  }
  // Sell
  if (amount < 0) {
    if (stocksOwned <= 0) {
      return
    }
    if (forced) {
      addLog('FORCE_SELL', stockPrice)
    } else {
      addLog('SELL', stockPrice)
    }
  }

  if (target instanceof Element) {
    target.classList.remove('play-animation')
    target.clientHeight
    target.classList.add('play-animation')
  }

  funds -= amount * stockPrice
  stocksOwned += amount
}

let trend = 0
let trendTimeLeft = 1.0
const generateValue = (delta: number) => {
  stockPrice *= 0.9994 + ((Math.random() - 0.5) * 12.0 + trend) * 0.001
  trendTimeLeft -= delta
  if (trendTimeLeft < 0.0) {
    trend = (Math.random() - 0.5) * 13.0

    if (stockPrice < 700) {
      trend += 1.0
    }

    if (stockPrice < 600) {
      trend += 1.5
    }

    if (stockPrice < 400) {
      trend = Math.abs(trend)
    }
    trendTimeLeft = Math.random() * 6
  }
}

let elements: Record<string, HTMLElement | null> = {
  funds: null,
  stocksOwned: null,
  portfolioValue: null,
  stockPrice: null,
  buy: null,
  sell: null,
  barGraph: null,
  ceilMarker: null,
  floorMarker: null,
  currentValue: null,
  dailyChange: null,
  gradientRed: null,
  wallpaper: null,
  effects: null,
  log: null,
}

let isElementsSet = false
const setElements = () => {
  for (const key in elements) {
    elements[key] = document.querySelector<HTMLElement>('#' + key)
    if (key === 'buy' && elements[key]) {
      elements[key].addEventListener('click', (event) =>
        exchangeStock(1, event.target),
      )
    }
    if (key === 'sell' && elements[key]) {
      elements[key].addEventListener('click', (event) =>
        exchangeStock(-1, event.target),
      )
    }
  }
  const values = Object.values(elements)
  isElementsSet = values.filter((e) => e === null).length === 0
}

const offsetForPrice = (
  price: number,
  ceil: number,
  floor: number,
  elementHeight: number,
) => {
  const fraction = (price - floor) / (ceil - floor)
  return (1.0 - fraction) * elementHeight
}

let canBuyOld = true
let canSellOld = false
let oldTime = 0
let nextPriceUpdate = 0
let updatesToday = 0
let todaysMinMax: [number, number] = [0, 0]
let day = 0
let closingPrice = stockPrice
let nextRentDay = 7

const UPDATES_PER_DAY = 8

let ceil = 1200
let floor = 600

let trendLerp = 1.0

const logText = {
  BUY: 'Purchased a share for $',
  SELL: 'Sold a share for $',
  RENT: 'Your weekly expenses cost $',
  FORCE_SELL: 'Forced to sell a share for $',
}

const addLog = (
  event: 'BUY' | 'SELL' | 'RENT' | 'FORCE_SELL',
  amount: number,
) => {
  const newDiv = document.createElement('div')
  newDiv.textContent = logText[event] + amount.toFixed(2)
  newDiv.className = 'log-entry'
  elements.log!.prepend(newDiv)
  const children = elements.log!.children
  const numChildren = children.length
  if (numChildren > 5) {
    const el = children[5]
    elements.log!.removeChild(el)
    el.remove()
  }
}

const raf = (time: number) => {
  if (oldTime === 0) {
    oldTime = time
    nextPriceUpdate = time - (time % 100) + 100
  }

  const delta = (time - oldTime) * 0.001
  oldTime = time

  requestAnimationFrame(raf)

  if (!isElementsSet) {
    setElements()
    return
  }

  if (time > nextPriceUpdate) {
    nextPriceUpdate += 100
    generateValue(0.1)
    if (stockPrice < todaysMinMax[0] || todaysMinMax[0] === 0)
      todaysMinMax[0] = stockPrice
    if (stockPrice > todaysMinMax[1] || todaysMinMax[1] === 0)
      todaysMinMax[1] = stockPrice
    updatesToday += 1

    const totalHeight = elements.barGraph!.clientHeight
    const totalWidth = elements.barGraph!.clientWidth
    if (updatesToday >= UPDATES_PER_DAY) {
      if (todaysMinMax[0] < floor + 50) {
        floor = Math.round((todaysMinMax[0] - 50) / 10) * 10
        ceil = floor + 600
      } else if (todaysMinMax[1] > ceil - 50) {
        ceil = Math.round((todaysMinMax[1] + 50) / 10) * 10
        floor = ceil - 600
      }

      elements.ceilMarker!.innerHTML = '$' + ceil
      elements.floorMarker!.innerHTML = '$' + floor

      updatesToday = 0
      const newBar = document.createElement('div')
      if (stockPrice > closingPrice) {
        newBar.className = 'absolute bg-green-400 bar-animation opacity-80'
      } else {
        newBar.className = 'absolute bg-rose-500 bar-animation opacity-80'
      }
      const minOffset = offsetForPrice(
        todaysMinMax[0],
        ceil,
        floor,
        totalHeight,
      )
      const maxOffset = offsetForPrice(
        todaysMinMax[1],
        ceil,
        floor,
        totalHeight,
      )
      closingPrice = stockPrice
      newBar.style.height = '1px'
      newBar.style.width = '6px'
      const heightPx = Math.max(1.1, minOffset - maxOffset)
      newBar.style.scale = `1.0 ${heightPx}`
      newBar.style.translate = `0 ${minOffset}px`
      newBar.setAttribute('minVal', todaysMinMax[0].toString())
      newBar.setAttribute('maxVal', todaysMinMax[1].toString())
      elements.barGraph?.appendChild(newBar)
      let counter = 0
      const numChildren = elements.barGraph!.children.length
      const barWidth = 16
      const childrenToRemove = Math.max(
        0,
        Math.ceil((numChildren * barWidth - totalWidth * 0.75) / barWidth),
      )
      for (const el of elements.barGraph!.children) {
        if (el instanceof HTMLElement) {
          const scaleY = parseFloat(el.style.scale.split(' ')[1])
          const yPos =
            offsetForPrice(
              parseInt(el.getAttribute('minVal') ?? '0'),
              ceil,
              floor,
              totalHeight,
            ) -
            scaleY * 0.5 +
            'px'
          el.style.translate = `${(counter + 1 - childrenToRemove) * barWidth}px ${yPos}`
          if (counter < childrenToRemove) {
            el.style.visibility = 'hidden'
            setTimeout(() => {
              elements.barGraph!.removeChild(el)
              el.remove()
            }, 1)
          }
        }
        counter += 1
      }
      todaysMinMax[0] = stockPrice
      todaysMinMax[1] = stockPrice
      day += 1

      nextRentDay -= 1
      if (nextRentDay === 0) {
        const rentAmount = 800
        while (funds < rentAmount && stocksOwned > 0) {
          exchangeStock(-1, elements.sell!, true)
        }
        funds -= rentAmount
        addLog('RENT', rentAmount)
        nextRentDay = 7
      }
    }

    elements.currentValue!.style.transform = `translateY(${offsetForPrice(stockPrice, ceil, floor, totalHeight)}px)`

    elements.stockPrice!.innerHTML = `${stockPrice.toFixed(2)}`
    const change = stockPrice - closingPrice
    const sign = change >= 0 ? '+' : '-'
    const unsignedChange = Math.abs(change)
    elements.dailyChange!.innerHTML = `${sign + unsignedChange.toFixed(2)} (${((unsignedChange / closingPrice) * 100).toFixed(2)}%)`
    if (change >= 0) {
      elements.dailyChange?.classList.remove('change-down')
      elements.dailyChange?.classList.add('change-up')
    } else {
      elements.dailyChange?.classList.remove('change-up')
      elements.dailyChange?.classList.add('change-down')
    }
  }

  const canBuy = funds >= stockPrice
  const canSell = stocksOwned > 0

  if (canBuy !== canBuyOld) {
    canBuy
      ? elements.buy!.removeAttribute('disabled')
      : elements.buy!.setAttribute('disabled', 'true')
  }
  if (canSell !== canSellOld) {
    canSell
      ? elements.sell!.removeAttribute('disabled')
      : elements.sell!.setAttribute('disabled', 'true')
  }

  canBuyOld = canBuy
  canSellOld = canSell

  elements.portfolioValue!.innerHTML = `$${portfolioValue().toFixed(2)}`
  elements.stocksOwned!.innerHTML = `${stocksOwned.toString()}`
  elements.funds!.innerHTML = `$${funds.toFixed(2)}`

  if (trend > 0.0 && trendLerp > 0.0) {
    trendLerp -= delta * 0.35
    trendLerp = Math.max(0.0, trendLerp)
    elements.gradientRed!.style.opacity = trendLerp.toString()
  }

  if (trend < 0.0 && trendLerp < 1.0) {
    trendLerp += delta * 0.35
    trendLerp = Math.min(1.0, trendLerp)
    elements.gradientRed!.style.opacity = trendLerp.toString()
  }
}

const audio = new Audio('./bgm.mp3')
const promise = new Promise((resolve) => {
  audio.addEventListener('canplaythrough', resolve)
})

const start = async () => {
  await promise
  document.querySelector('#startBackground')?.remove()
  requestAnimationFrame(raf)
  /*
  audio.addEventListener('ended', () => {
    audio.currentTime = 0
    audio.play()
  })
    */
  audio.loop = true
  audio.play()
}

document.querySelector('#startGame')?.addEventListener('click', start)

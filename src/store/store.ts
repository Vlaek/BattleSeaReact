import { create } from 'zustand'
import { DirectionType } from '../types'
import {
  BATTLE_SIZE,
  BOT_NAME,
  INITIAL_MAP,
  INITIAL_SHIPS,
  PLAYER_NAME,
  SHOT_TIME,
} from '../constants'

export interface IGameState {
  playerName: string
  botName: string

  playerMap: number[][]
  botMap: number[][]

  playerShips: number[]
  botShips: number[]

  isStartGame: boolean
  isBotTurn: boolean
  gameEnded: boolean
  winner: string | null

  coordFirstHit: {
    x: number
    y: number
  } | null

  coordLastHit: {
    x: number
    y: number
  } | null

  coordDirection: DirectionType | null
  possibleDirection: DirectionType | null

  botShots: string[]

  setIsStartGame: (isStart: boolean) => void
  setIsBotTurn: (isBotTurn: boolean) => void
  initNewGame: () => void

  onShot: (x: number, y: number, isBot: boolean) => void
  generateShips: (isBot: boolean) => void
}

const initState = {
  playerName: PLAYER_NAME,
  botName: BOT_NAME,

  playerMap: INITIAL_MAP,
  botMap: INITIAL_MAP,

  playerShips: INITIAL_SHIPS,
  botShips: INITIAL_SHIPS,

  isStartGame: false,
  isBotTurn: false,
  gameEnded: false,
  winner: null,

  coordFirstHit: null,
  coordLastHit: null,
  coordDirection: null,
  possibleDirection: null,
  botShots: [],
}

const useGameStore = create<IGameState>((set, get) => ({
  ...initState,

  setIsStartGame: (isStart) => set({ isStartGame: isStart }),

  setIsBotTurn: (isBotTurn) => set({ isBotTurn: isBotTurn }),

  initNewGame: () => {
    set({ ...initState, isStartGame: true })
    get().generateShips(false)
    get().generateShips(true)
  },

  onShot: (x, y, isBot) => {
    const state = get()
    const targetMap = isBot ? [...state.playerMap] : [...state.botMap]
    const targetShips = isBot ? [...state.playerShips] : [...state.botShips]
    let shipType = 0

    if (get().isBotTurn) {
      set({ botShots: [...get().botShots.sort(), `${x}:${y}`] })
    }

    if (targetMap[x][y] >= 1) {
      shipType = targetMap[x][y]
      targetShips[shipType]--

      if (targetShips[shipType] <= 0) {
        // Убитый корабль
        for (let i = 0; i < targetMap.length; i++) {
          for (let j = 0; j < targetMap[i].length; j++) {
            if (targetMap[i][j] === shipType) {
              targetMap[i][j] = -2 // убит
            }
          }
        }

        const directions = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]

        const queue = [[x, y]]
        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!
          for (const [dx, dy] of directions) {
            const nx = cx + dx
            const ny = cy + dy
            if (
              nx >= 0 &&
              nx < targetMap.length &&
              ny >= 0 &&
              ny < targetMap[0].length &&
              targetMap[nx][ny] === -1
            ) {
              targetMap[nx][ny] = -2 // убит
              queue.push([nx, ny])
            }
          }
        }

        // Закрашивание клеток вокруг убитого корабля
        for (let i = 0; i < targetMap.length; i++) {
          for (let j = 0; j < targetMap[i].length; j++) {
            if (targetMap[i][j] === -2) {
              directions.forEach(([dx, dy]) => {
                const nx = i + dx
                const ny = j + dy
                if (
                  nx >= 0 &&
                  nx < targetMap.length &&
                  ny >= 0 &&
                  ny < targetMap[0].length &&
                  targetMap[nx][ny] === 0
                ) {
                  targetMap[nx][ny] = -3 // мимо
                  if (get().isBotTurn) {
                    set({ botShots: [...get().botShots, `${nx}:${ny}`] })
                  }
                }
              })
            }
          }
        }

        if (get().isBotTurn) {
          console.log('Кораблик убит. Сброс состояний')
          set({
            coordFirstHit: null,
            coordLastHit: null,
            coordDirection: null,
            possibleDirection: null,
          })
        }
      } else {
        targetMap[x][y] = -1 // попал
        if (get().isBotTurn) {
          if (get().coordFirstHit) {
            console.log(`Попал повторно в ${x}:${y}`)
            set({ coordLastHit: { x, y } })
            if (get().possibleDirection) {
              set({ coordDirection: get().possibleDirection })
              console.log('Направление выбрано,', get().possibleDirection)
            }
          } else {
            console.log(`Попал первый раз в ${y}:${x}`)
            set({ coordFirstHit: { x, y }, coordLastHit: { x, y } })
          }
        }
      }
    } else if (targetMap[x][y] !== -1 && targetMap[x][y] !== -2) {
      targetMap[x][y] = -3 // промах

      console.log(get().coordDirection)
      if (get().coordDirection && get().isBotTurn) {
        console.log('Направление выбрано в обратную сторону, так как был промох')
        if (get().coordDirection === 'top') {
          set({
            coordDirection: 'bottom',
            possibleDirection: 'bottom',
            coordLastHit: get().coordFirstHit,
          })
        } else if (get().coordDirection === 'bottom') {
          set({
            coordDirection: 'top',
            possibleDirection: 'top',
            coordLastHit: get().coordFirstHit,
          })
        } else if (get().coordDirection === 'right') {
          set({
            coordDirection: 'left',
            possibleDirection: 'left',
            coordLastHit: get().coordFirstHit,
          })
        } else if (get().coordDirection === 'left') {
          set({
            coordDirection: 'right',
            possibleDirection: 'right',
            coordLastHit: get().coordFirstHit,
          })
        }
      }
      set({ isBotTurn: !state.isBotTurn })
    }

    const newState = isBot
      ? { playerMap: targetMap, playerShips: targetShips }
      : { botMap: targetMap, botShips: targetShips }

    set(newState)

    const playerHasShips = get().playerShips.some((ship) => ship > 0)
    const botHasShips = get().botShips.some((ship) => ship > 0)

    if (!playerHasShips || !botHasShips) {
      set({ gameEnded: true, winner: playerHasShips ? BOT_NAME : PLAYER_NAME })
    }

    if (!get().gameEnded && get().isBotTurn) {
      setTimeout(() => {
        const state = get()
        let x, y
        let nextShotX = 0,
          nextShotY = 0

        // если попал в корабль
        if (state.coordLastHit && state.coordFirstHit) {
          const { x: coordHitX, y: coordHitY } = state.coordLastHit
          const direction = state.coordDirection
          if (direction) {
            if (direction === 'top') {
              nextShotX = coordHitX - 1
              nextShotY = coordHitY
            } else if (direction === 'bottom') {
              nextShotX = coordHitX + 1
              nextShotY = coordHitY
            } else if (direction === 'right') {
              nextShotX = coordHitX
              nextShotY = coordHitY + 1
            } else if (direction === 'left') {
              nextShotX = coordHitX
              nextShotY = coordHitY - 1
            }

            if (
              nextShotX >= 0 &&
              nextShotX < BATTLE_SIZE &&
              nextShotY >= 0 &&
              nextShotY < BATTLE_SIZE &&
              !get().botShots.includes(`${nextShotX}:${nextShotY}`)
            ) {
              console.log(`Выстрел по установленному направлению в ${nextShotY}:${nextShotX}`)
              state.onShot(nextShotX, nextShotY, false)
              return
            } else {
              if (direction) {
                console.log(
                  'Направление выбрано в обратную сторону, так как дальше нельзя стрелять по условиям',
                )
                if (direction === 'top') {
                  set({
                    coordDirection: 'bottom',
                    possibleDirection: 'bottom',
                    coordLastHit: get().coordFirstHit,
                  })
                } else if (direction === 'bottom') {
                  set({
                    coordDirection: 'top',
                    possibleDirection: 'top',
                    coordLastHit: get().coordFirstHit,
                  })
                } else if (direction === 'right') {
                  set({
                    coordDirection: 'left',
                    possibleDirection: 'left',
                    coordLastHit: get().coordFirstHit,
                  })
                } else if (direction === 'left') {
                  set({
                    coordDirection: 'right',
                    possibleDirection: 'right',
                    coordLastHit: get().coordFirstHit,
                  })
                }
              }

              console.log('Выстрел дальше (невозможен)', nextShotX, nextShotY)
              console.log('Первое попадание', get().coordFirstHit?.x, get().coordFirstHit?.y)
              const { x: newCoordHitX, y: newCoordHitY } = get().coordFirstHit ?? { x: 0, y: 0 }
              console.log('Новый выстрел дальше', newCoordHitX, newCoordHitY)

              if (get().coordDirection === 'top') {
                nextShotX = newCoordHitX - 1
                nextShotY = newCoordHitY
              } else if (get().coordDirection === 'bottom') {
                nextShotX = newCoordHitX + 1
                nextShotY = newCoordHitY
              } else if (get().coordDirection === 'right') {
                nextShotX = newCoordHitX
                nextShotY = newCoordHitY + 1
              } else if (get().coordDirection === 'left') {
                nextShotX = newCoordHitX
                nextShotY = newCoordHitY - 1
              }
              console.log(`Выстрел в обратную сторону в ${nextShotY}:${nextShotX}`)
              state.onShot(nextShotX, nextShotY, false)
              return
            }
          }

          const possibleDirections: DirectionType[] = ['bottom', 'top', 'right', 'left']

          for (const dir of possibleDirections) {
            let nextShotX = 0
            let nextShotY = 0

            if (dir === 'top') {
              nextShotX = coordHitX - 1
              nextShotY = coordHitY
            } else if (dir === 'bottom') {
              nextShotX = coordHitX + 1
              nextShotY = coordHitY
            } else if (dir === 'right') {
              nextShotX = coordHitX
              nextShotY = coordHitY + 1
            } else if (dir === 'left') {
              nextShotX = coordHitX
              nextShotY = coordHitY - 1
            }

            if (
              nextShotX >= 0 &&
              nextShotX < BATTLE_SIZE &&
              nextShotY >= 0 &&
              nextShotY < BATTLE_SIZE &&
              !get().botShots.includes(`${nextShotX}:${nextShotY}`)
            ) {
              console.log(`Выстрел по возможному направлению в ${nextShotY}:${nextShotX}`)
              set({ possibleDirection: dir })
              state.onShot(nextShotX, nextShotY, false)
              return
            }
          }
        }

        do {
          x = Math.floor(Math.random() * BATTLE_SIZE)
          y = Math.floor(Math.random() * BATTLE_SIZE)
          console.log(get().botShots)
        } while (get().botShots.includes(`${x}:${y}`))
        console.log(`Рандомный выстрел в ${y}:${x}`)
        state.onShot(x, y, false)
        return
      }, SHOT_TIME)
    }
  },

  generateShips: (isBot) =>
    set(() => {
      const map = Array.from({ length: BATTLE_SIZE }, () => Array(BATTLE_SIZE).fill(0))
      const ships = [...INITIAL_SHIPS]

      ships.forEach((ship, index) => {
        if (index > 0) setRandShips(map, ship, index)
      })

      return isBot ? { botMap: map, botShips: ships } : { playerMap: map, playerShips: ships }
    }),
}))

const setRandShips = (map: number[][], sizeShip: number, shipId: number): void => {
  let count = 0
  let tact = 0

  while (count < 1) {
    tact++

    if (tact > 1000) {
      break
    }

    let x = Math.floor(Math.random() * BATTLE_SIZE)
    let y = Math.floor(Math.random() * BATTLE_SIZE)

    const tempX = x
    const tempY = y

    const directions = Math.floor(Math.random() * 4)

    let possible = true

    for (let i = 0; i < sizeShip; i++) {
      if (x < 0 || y < 0 || x >= BATTLE_SIZE || y >= BATTLE_SIZE) {
        possible = false
        break
      }

      if (
        map[x][y] >= 1 ||
        (x + 1 < BATTLE_SIZE && map[x + 1][y] >= 1) ||
        (x - 1 >= 0 && map[x - 1][y] >= 1) ||
        (x + 1 < BATTLE_SIZE && y + 1 < BATTLE_SIZE && map[x + 1][y + 1] >= 1) ||
        (x + 1 < BATTLE_SIZE && y - 1 >= 0 && map[x + 1][y - 1] >= 1) ||
        (x - 1 >= 0 && y + 1 < BATTLE_SIZE && map[x - 1][y + 1] >= 1) ||
        (x - 1 >= 0 && y - 1 >= 0 && map[x - 1][y - 1] >= 1) ||
        (y + 1 < BATTLE_SIZE && map[x][y + 1] >= 1) ||
        (y - 1 >= 0 && map[x][y - 1] >= 1)
      ) {
        possible = false
        break
      }

      switch (directions) {
        case 0:
          x++
          break
        case 1:
          y++
          break
        case 2:
          x--
          break
        case 3:
          y--
          break
      }
    }

    if (possible) {
      x = tempX
      y = tempY

      for (let i = 0; i < sizeShip; i++) {
        map[x][y] = shipId

        switch (directions) {
          case 0:
            x++
            break
          case 1:
            y++
            break
          case 2:
            x--
            break
          case 3:
            y--
            break
        }
      }
      count++
    }
  }
}

export default useGameStore

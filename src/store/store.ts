import { create } from 'zustand'

const BATTLE_SIZE = 10
const INITIAL_SHIPS: number[] = [0, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
const INITIAL_MAP: number[][] = Array.from({ length: BATTLE_SIZE }, () =>
  Array(BATTLE_SIZE).fill(0),
)
const PLAYER_NAME = 'Игрок'
const BOT_NAME = 'Бот'

const botShots: string[] = []

type DirectionType = 'top' | 'bottom' | 'right' | 'left'

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

  setMap: (newMap: number[][]) => void
  setbotMap: (newMap: number[][]) => void

  setShips: (newShips: number[]) => void
  setbotShips: (newShips: number[]) => void

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
}

const useGameStore = create<IGameState>((set, get) => ({
  ...initState,

  setMap: (newMap) => set({ playerMap: newMap }),
  setbotMap: (newMap) => set({ botMap: newMap }),

  setShips: (newShips) => set({ playerShips: newShips }),
  setbotShips: (newShips) => set({ botShips: newShips }),

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
                  botShots.push(`${nx}:${ny}`)
                }
              })
            }
          }
        }

        if (get().isBotTurn) {
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
          // если уже попадал в корабль, то сетим только ласт тычку, иначе ферст и ласт
          if (get().coordFirstHit) {
            set({ coordLastHit: { x, y } })
            if (get().possibleDirection) {
              set({ coordDirection: get().possibleDirection })
            }
          } else {
            set({ coordFirstHit: { x, y }, coordLastHit: { x, y } })
          }
        }
      }
    } else if (targetMap[x][y] !== -1 && targetMap[x][y] !== -2) {
      targetMap[x][y] = -3 // промах

      if (get().coordDirection && get().isBotTurn) {
        if (get().coordDirection === 'top') {
          set({ coordDirection: 'bottom', coordLastHit: get().coordFirstHit })
        } else if (get().coordDirection === 'bottom') {
          set({ coordDirection: 'top', coordLastHit: get().coordFirstHit })
        } else if (get().coordDirection === 'right') {
          set({ coordDirection: 'left', coordLastHit: get().coordFirstHit })
        } else if (get().coordDirection === 'left') {
          set({ coordDirection: 'right', coordLastHit: get().coordFirstHit })
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
      console.log(`${get().gameEnded} - ${get().winner}`)
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
            console.log('direction', direction)

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
            // const [shotX, shotY] = getNewCoordByDirection(coordHitX, coordHitY, direction)

            if (
              nextShotX >= 0 &&
              nextShotX < BATTLE_SIZE &&
              nextShotY >= 0 &&
              nextShotY < BATTLE_SIZE &&
              !botShots.includes(`${nextShotX}:${nextShotY}`)
            ) {
              botShots.push(`${nextShotX}:${nextShotY}`)
              state.onShot(nextShotX, nextShotY, false)
              return
            } else {
              if (get().coordDirection) {
                console.log('244')
                if (get().coordDirection === 'top') {
                  set({ coordDirection: 'bottom', coordLastHit: get().coordFirstHit })
                } else if (get().coordDirection === 'bottom') {
                  set({ coordDirection: 'top', coordLastHit: get().coordFirstHit })
                } else if (get().coordDirection === 'right') {
                  set({ coordDirection: 'left', coordLastHit: get().coordFirstHit })
                } else if (get().coordDirection === 'left') {
                  set({ coordDirection: 'right', coordLastHit: get().coordFirstHit })
                }
              }

              const { x: newCoordHitX, y: newCoordHitY } = state.coordLastHit

              if (direction === 'top') {
                nextShotX = newCoordHitX - 1
                nextShotY = newCoordHitY
              } else if (direction === 'bottom') {
                nextShotX = newCoordHitX + 1
                nextShotY = newCoordHitY
              } else if (direction === 'right') {
                nextShotX = newCoordHitX
                nextShotY = newCoordHitY + 1
              } else if (direction === 'left') {
                nextShotX = newCoordHitX
                nextShotY = newCoordHitY - 1
              }

              botShots.push(`${nextShotX}:${nextShotY}`)
              state.onShot(nextShotX, nextShotY, false)
              return
            }
          }

          const possibleDirections: DirectionType[] = ['bottom', 'top', 'right', 'left']

          for (const dir of possibleDirections) {
            let nextShotX = 0
            let nextShotY = 0

            console.log(dir)
            set({ possibleDirection: dir })

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
              !botShots.includes(`${nextShotX}:${nextShotY}`)
            ) {
              botShots.push(`${nextShotX}:${nextShotY}`)
              state.onShot(nextShotX, nextShotY, false)
              return
            }
          }
        } else {
          do {
            x = Math.floor(Math.random() * BATTLE_SIZE)
            y = Math.floor(Math.random() * BATTLE_SIZE)
          } while (botShots.includes(`${x}:${y}`))

          botShots.push(`${x}:${y}`)
          state.onShot(x, y, false)
        }
      }, 1000)
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

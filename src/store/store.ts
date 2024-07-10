import { create } from 'zustand'

const BATTLE_SIZE = 10
const INITIAL_SHIPS: number[] = [0, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
const INITIAL_MAP: number[][] = Array.from({ length: BATTLE_SIZE }, () =>
  Array(BATTLE_SIZE).fill(0),
)

const botShots: string[] = []

export interface IGameState {
  playerMap: number[][]
  botMap: number[][]

  playerShips: number[]
  botShips: number[]

  isStartGame: boolean
  isBotTurn: boolean
  gameEnded: boolean
  winner: string | null

  setMap: (newMap: number[][]) => void
  setbotMap: (newMap: number[][]) => void

  setShips: (newShips: number[]) => void
  setbotShips: (newShips: number[]) => void

  setIsStartGame: (isStart: boolean) => void
  setIsBotTurn: (isBotTurn: boolean) => void
  initNewGame: () => void

  onShot: (x: number, y: number, isBot: boolean) => void
  generateShips: (isBot: boolean) => void
  // botShoot: (test: boolean) => void
}

const useGameStore = create<IGameState>((set, get) => ({
  playerMap: INITIAL_MAP,
  botMap: INITIAL_MAP,

  playerShips: INITIAL_SHIPS,
  botShips: INITIAL_SHIPS,

  isStartGame: false,
  isBotTurn: false,
  gameEnded: false,
  winner: null,

  setMap: (newMap) => set({ playerMap: newMap }),
  setbotMap: (newMap) => set({ botMap: newMap }),

  setShips: (newShips) => set({ playerShips: newShips }),
  setbotShips: (newShips) => set({ botShips: newShips }),

  setIsStartGame: (isStart) => set({ isStartGame: isStart }),
  setIsBotTurn: (isBotTurn) => set({ isBotTurn: isBotTurn }),
  initNewGame: () => {
    get().generateShips(false)
    get().generateShips(true)
    set({ isStartGame: true, isBotTurn: false, gameEnded: false, winner: null })
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
      } else {
        targetMap[x][y] = -1 // попал
      }
    } else if (targetMap[x][y] !== -1 && targetMap[x][y] !== -2) {
      targetMap[x][y] = -3 // промах
      set({ isBotTurn: !state.isBotTurn }) // переключаем ход
    }

    const newState = isBot
      ? { playerMap: targetMap, playerShips: targetShips }
      : { botMap: targetMap, botShips: targetShips }

    set(newState)

    const playerHasShips = get().playerShips.some((ship) => ship > 0)
    const botHasShips = get().botShips.some((ship) => ship > 0)

    if (!playerHasShips || !botHasShips) {
      set({ gameEnded: true, winner: playerHasShips ? 'bot' : 'player' })
      console.log(`${get().gameEnded} - ${get().winner}`)
    }

    if (!get().gameEnded && get().isBotTurn) {
      setTimeout(() => {
        const state = get()
        let x, y
        do {
          x = Math.floor(Math.random() * BATTLE_SIZE)
          y = Math.floor(Math.random() * BATTLE_SIZE)
        } while (botShots.includes(`${x}:${y}`))
        botShots.push(`${x}:${y}`)
        state.onShot(x, y, false)
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

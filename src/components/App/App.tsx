import { FC, useEffect, useState } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'

const BATTLE_SIZE = 10
const INITIAL_SHIPS = [0, 4, 3, 3, 2, 2, 2, 1, 1, 1]

function setRandShips(map: number[][], sizeShip: number, shipId: number): void {
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

const App: FC = () => {
  const [map, setMap] = useState<number[][]>(
    Array.from({ length: BATTLE_SIZE }, () => Array(BATTLE_SIZE).fill(0)),
  )
  const [mask, setMask] = useState<number[][]>(
    Array.from({ length: BATTLE_SIZE }, () => Array(BATTLE_SIZE).fill(0)),
  )
  const [ships, setShips] = useState<number[]>(INITIAL_SHIPS)

  const initializeGameState = () => {
    const initialShips = [...INITIAL_SHIPS]
    setShips(initialShips)

    const newMap = Array.from({ length: BATTLE_SIZE }, () => Array(BATTLE_SIZE).fill(0))

    initialShips.forEach((ship, index) => {
      if (index > 0) setRandShips(newMap, ship, index)
    })

    setMap(newMap)
  }

  const shot = (x: number, y: number, ships: number[]): void => {
    let shipType = 0

    setMap((prevMap) => {
      const newMap = [...prevMap]

      if (newMap[x][y] >= 1) {
        shipType = newMap[x][y]

        setShips((prevShips) => {
          const newShips = [...prevShips]
          newShips[shipType]--
          return newShips
        })

        if (ships[shipType] - 1 <= 0) {
          for (let i = 0; i < newMap.length; i++) {
            for (let j = 0; j < newMap[i].length; j++) {
              if (newMap[i][j] === shipType) {
                newMap[i][j] = -2 // убит
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
                nx < newMap.length &&
                ny >= 0 &&
                ny < newMap[0].length &&
                newMap[nx][ny] === -1
              ) {
                newMap[nx][ny] = -2 // убит
                queue.push([nx, ny])
              }
            }
          }
        } else {
          newMap[x][y] = -1 // попал
        }
      } else if (newMap[x][y] !== -1 && newMap[x][y] !== -2) {
        newMap[x][y] = -3 // промах
      }

      return newMap
    })

    setMask((prevMask) => {
      const newMask = [...prevMask]
      newMask[x][y] = 1
      return newMask
    })
  }

  useEffect(() => {
    const checkIsEndGame = (): boolean => {
      return ships.find((item) => item > 0) ? false : true
    }

    if (checkIsEndGame()) {
      console.log('lose')
    }
  }, [ships])

  return (
    <div className={styles.container}>
      <button onClick={initializeGameState} className={styles.btn}>
        Начать игру
      </button>
      <div className={styles.tables}>
        <Drawing map={map} mask={mask} onShot={shot} ships={ships} />
      </div>
    </div>
  )
}

export default App

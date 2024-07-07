import { FC, useState } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'

const N = 10

function setRandShips(map: number[][], sizeShip: number, shipId: number): void {
  let count = 0
  let tact = 0

  while (count < 1) {
    tact++

    if (tact > 1000) {
      break
    }

    let x = Math.floor(Math.random() * N) // первичная позиция
    let y = Math.floor(Math.random() * N)

    const tempX = x
    const tempY = y

    const dir = Math.floor(Math.random() * 4) // генерация направления

    let possible = true // проверка возможности

    for (let i = 0; i < sizeShip; i++) {
      if (x < 0 || y < 0 || x >= N || y >= N) {
        possible = false
        break
      }

      if (
        map[x][y] >= 1 ||
        (x + 1 < N && map[x + 1][y] >= 1) ||
        (x - 1 >= 0 && map[x - 1][y] >= 1) ||
        (x + 1 < N && y + 1 < N && map[x + 1][y + 1] >= 1) ||
        (x + 1 < N && y - 1 >= 0 && map[x + 1][y - 1] >= 1) ||
        (x - 1 >= 0 && y + 1 < N && map[x - 1][y + 1] >= 1) ||
        (x - 1 >= 0 && y - 1 >= 0 && map[x - 1][y - 1] >= 1) ||
        (y + 1 < N && map[x][y + 1] >= 1) ||
        (y - 1 >= 0 && map[x][y - 1] >= 1)
      ) {
        possible = false
        break
      }

      switch (dir) {
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

        switch (dir) {
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

function shot(x: number, y: number, map: number[][], mask: number[][], ships: number[]): number {
  let result = 0

  if (map[x][y] === -1 || map[x][y] === -2) {
    result = 3 // уже стрелял
  } else if (map[x][y] >= 1) {
    ships[map[x][y]]--
    if (ships[map[x][y]] <= 0) {
      result = 2 // убит
    } else {
      result = 1 // попал
    }
    map[x][y] = -1
  } else {
    map[x][y] = -2 // промах
  }
  mask[x][y] = 1

  return result
}

const App: FC = () => {
  const [map, setMap] = useState<number[][]>(Array.from({ length: N }, () => Array(N).fill(0)))
  const [mask] = useState<number[][]>(Array.from({ length: N }, () => Array(N).fill(0)))
  const [initialShips] = useState<number[]>([0, 4, 3, 3, 2, 2, 2, 1, 1, 1])

  const initializeMaps = () => {
    const newMap = Array.from({ length: N }, () => Array(N).fill(0))
    initialShips.forEach((ship, index) => {
      if (index > 0) setRandShips(newMap, ship, index)
    })
    setMap(newMap)
  }

  console.log(map)
  console.log(mask)

  const x = 4
  const y = 4
  const result = shot(x, y, map, mask, initialShips)
  console.log(result)

  return (
    <div className={styles.container}>
      <button onClick={initializeMaps} className={styles.btn}>
        Start Game
      </button>
      <Drawing map={map} mask={mask} useMask={true} />
    </div>
  )
}

export default App

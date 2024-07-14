import { FC, useEffect, useMemo, useState } from 'react'
import styles from './Cell.module.css'
import useGameStore from '../../store/store'

interface CellProps {
  value: number
  x: number
  y: number
  isBot: boolean
}

const USE_MASK = false

const Cell: FC<CellProps> = (props) => {
  const [state, setState] = useState({})
  const [timer, setTimer] = useState<undefined | number>()
  const { value, x, y, isBot } = props
  const { isStartGame, isBotTurn, gameEnded, onShot } = useGameStore((state) => ({
    isStartGame: state.isStartGame,
    isBotTurn: state.isBotTurn,
    gameEnded: state.gameEnded,
    onShot: state.onShot,
  }))

  const backgroundColorArray = useMemo(() => {
    const colors = new Map()
    colors.set(0, 'white')
    colors.set(-1, 'yellow')
    colors.set(-2, 'red')
    colors.set(-3, 'transparent')
    return colors
  }, [])

  const handleOnClick = () => {
    if (isBot && isStartGame && !isBotTurn && value >= 0 && !gameEnded) {
      onShot(x, y, isBot)
    }
  }

  useEffect(() => {
    if (value === -2 || value === -1) {
      setState({
        background: `center / contain no-repeat url(./images/explosion.gif) ${backgroundColorArray.get(
          value,
        )}`,
      })
      setTimer(
        setTimeout(() => {
          setState({})
        }, 1000),
      )
    }
    if (value === -3) {
      setState({
        background: `center / contain no-repeat url(./images/water.gif) ${backgroundColorArray.get(
          value,
        )}`,
      })
      setTimer(
        setTimeout(() => {
          setState({})
        }, 1000),
      )
    }
  }, [backgroundColorArray, value])

  useEffect(() => () => clearTimeout(timer), [timer])

  return (
    <div className={styles.container} onClick={handleOnClick}>
      <div
        className={styles.cell}
        style={{
          backgroundColor:
            value > 0 ? (isBot && USE_MASK ? 'white' : 'green') : backgroundColorArray.get(value),
          borderColor: value === -3 ? 'transparent' : 'black',
        }}
      >
        {/* {value} */}
      </div>
      <div
        className={styles.cell_effect}
        style={{ ...state, borderColor: value === -3 ? 'transparent' : 'black' }}
      ></div>
    </div>
  )
}

export { Cell }

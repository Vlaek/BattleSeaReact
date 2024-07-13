import { FC } from 'react'
import styles from './Cell.module.css'
import useGameStore from '../../store/store'

interface CellProps {
  value: number
  x: number
  y: number
  isBot: boolean
}

const Cell: FC<CellProps> = (props) => {
  const { value, x, y, isBot } = props
  const { isStartGame, isBotTurn, gameEnded, onShot } = useGameStore((state) => ({
    isStartGame: state.isStartGame,
    isBotTurn: state.isBotTurn,
    gameEnded: state.gameEnded,
    onShot: state.onShot,
  }))

  const handleOnClick = () => {
    if (
      isBot &&
      isStartGame &&
      !isBotTurn &&
      backgroundColorArray.get(value) !== 'transparent' &&
      !gameEnded
    ) {
      onShot(x, y, isBot)
    }
  }

  const backgroundColorArray = new Map()
  backgroundColorArray.set(0, 'white')
  backgroundColorArray.set(-1, 'yellow')
  backgroundColorArray.set(-2, 'red')
  backgroundColorArray.set(-3, 'transparent')

  return (
    <div
      className={styles.cell}
      style={{
        backgroundColor: value > 0 ? (isBot ? 'white' : 'green') : backgroundColorArray.get(value),
        borderColor: value === -3 ? 'transparent' : 'black',
      }}
      onClick={handleOnClick}
    >
      {/* {value} */}
    </div>
  )
}

export { Cell }

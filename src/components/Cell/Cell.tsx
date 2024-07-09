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
  const { isStartGame, isBotTurn, onShot, botShoot } = useGameStore((state) => ({
    isStartGame: state.isStartGame,
    isBotTurn: state.isBotTurn,
    onShot: state.onShot,
    botShoot: state.botShoot,
  }))

  const handleOnClick = () => {
    if (isBot && isStartGame) {
      onShot(x, y, isBot)

      if (isBotTurn) {
        botShoot()
      }
    }
  }

  const backgroundColorArray = new Map()
  backgroundColorArray.set(0, 'white')
  backgroundColorArray.set(-1, 'yellow')
  backgroundColorArray.set(-2, 'red')
  backgroundColorArray.set(-3, 'brown')

  return (
    <div
      className={styles.cell}
      style={{
        backgroundColor: value > 0 ? (isBot ? 'white' : 'green') : backgroundColorArray.get(value),
      }}
      onClick={handleOnClick}
    >
      {value}
    </div>
  )
}

export { Cell }

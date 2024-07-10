import { FC } from 'react'
import { Cell } from '../Cell/Cell'
import styles from './Drawing.module.css'
import useGameStore from '../../store/store'

interface IDrawingProps {
  isBot: boolean
  map: number[][]
}

const Drawing: FC<IDrawingProps> = (props) => {
  const { isBot, map } = props
  const { isBotTurn } = useGameStore((state) => ({
    isBotTurn: state.isBotTurn,
  }))
  // console.log(isBotTurn === isBot)

  return (
    <div className={styles.container}>
      <p style={{ outline: isBotTurn === isBot ? '2px solid red' : '' }} className={styles.title}>
        {isBot ? 'Бот' : 'Игрок'}
      </p>
      <div>
        {map.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.matrix}>
            {row.map((cell, cellIndex) => (
              <Cell key={cellIndex} value={cell} x={rowIndex} y={cellIndex} isBot={isBot} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Drawing

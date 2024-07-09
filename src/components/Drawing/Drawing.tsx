import { FC } from 'react'
import { Cell } from '../Cell/Cell'
import styles from './Drawing.module.css'

interface IDrawingProps {
  isBot: boolean
  map: number[][]
}

const Drawing: FC<IDrawingProps> = (props) => {
  const { isBot, map } = props

  return (
    <div className={styles.container}>
      <p className={styles.title}>{isBot ? 'Бот' : 'Игрок'}</p>
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

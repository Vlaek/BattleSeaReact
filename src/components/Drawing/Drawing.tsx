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
  const { playerName, botName, isBotTurn } = useGameStore((state) => ({
    isBotTurn: state.isBotTurn,
    playerName: state.playerName,
    botName: state.botName,
  }))

  return (
    <div className={styles.container}>
      <p style={{ outline: isBotTurn === isBot ? '2px solid red' : '' }} className={styles.title}>
        {isBot ? botName : playerName}
      </p>
      <div style={{ outline: '1px solid black' }}>
        {map.map((row, rowIndex) => (
          <div key={`${rowIndex}-row-${isBot}`} className={styles.matrix}>
            <div className={styles.row_index}>{rowIndex}</div>
            {row.map((cell, cellIndex) => (
              <>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {rowIndex === 0 && (
                    <div key={`${cellIndex}-column-${isBot}`} className={styles.column_index}>
                      {cellIndex}
                    </div>
                  )}
                  <Cell key={cellIndex} value={cell} x={rowIndex} y={cellIndex} isBot={isBot} />
                </div>
              </>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Drawing

import { FC } from 'react'
import { Cell } from '../Cell/Cell'
import styles from './Matrix.module.css'

interface MatrixProps {
  matrix: number[][]
  ships: number[]
  onShot: (x: number, y: number, ships: number[]) => void
}

const Matrix: FC<MatrixProps> = (props) => {
  const { matrix, ships, onShot } = props
  return (
    <div>
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.matrix}>
          {row.map((cell, cellIndex) => (
            <Cell
              key={cellIndex}
              value={cell}
              x={rowIndex}
              y={cellIndex}
              onShot={onShot}
              ships={ships}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Matrix }

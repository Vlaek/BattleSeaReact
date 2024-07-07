import { FC } from 'react'
import { Cell } from '../Cell/Cell'
import styles from './Matrix.module.css'

interface MatrixProps {
  matrix: number[][]
}

const Matrix: FC<MatrixProps> = (props) => {
  const { matrix } = props
  return (
    <div>
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.matrix}>
          {row.map((cell, cellIndex) => (
            <Cell key={cellIndex} value={cell} x={rowIndex} y={cellIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Matrix }

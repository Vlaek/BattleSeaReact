import { FC } from 'react'
import styles from './Cell.module.css'

interface CellProps {
  value: number
  x: number
  y: number
}

const Cell: FC<CellProps> = (props) => {
  const { value, x, y } = props

  const handleOnClick = () => {
    console.log(x, y)
  }

  return (
    <div
      className={styles.cell}
      style={{
        backgroundColor: value !== 0 ? 'yellow' : 'white',
      }}
      onClick={handleOnClick}
    >
      {value}
    </div>
  )
}

export { Cell }

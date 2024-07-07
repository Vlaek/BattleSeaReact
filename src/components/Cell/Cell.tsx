import { FC } from 'react'
import styles from './Cell.module.css'

interface CellProps {
  value: number
  x: number
  y: number
  ships: number[]
  isBot: boolean
  onShot: (x: number, y: number, ships: number[]) => void
}

const Cell: FC<CellProps> = (props) => {
  const { value, x, y, ships, isBot, onShot } = props

  const handleOnClick = () => {
    if (!isBot) {
      console.log('bot hodit')
    } else {
      onShot(x, y, ships)
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

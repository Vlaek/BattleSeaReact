import { FC } from 'react'
import { Matrix } from '../Matrix/Matrix'

interface IDrawingProps {
  map: number[][]
  mask: number[][]
  ships: number[]
  onShot: (x: number, y: number, ships: number[]) => void
}

const Drawing: FC<IDrawingProps> = (props) => {
  const { map, ships, onShot } = props
  return <Matrix matrix={map} onShot={onShot} ships={ships} />
}

export default Drawing

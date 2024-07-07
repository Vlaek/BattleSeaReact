import { FC } from 'react'
import { Matrix } from '../Matrix/Matrix'

interface IDrawingProps {
  map: number[][]
  mask: number[][]
  useMask: boolean
}

const Drawing: FC<IDrawingProps> = (props) => {
  const { map } = props
  return <Matrix matrix={map} />
}

export default Drawing

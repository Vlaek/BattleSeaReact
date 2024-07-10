import { FC } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'
import useGameStore from '../../store/store'

const App: FC = () => {
  const { playerMap, botMap, isStartGame, winner, initNewGame } = useGameStore((state) => ({
    playerMap: state.playerMap,
    botMap: state.botMap,
    playerShips: state.playerShips,
    botShips: state.botShips,
    isStartGame: state.isStartGame,
    winner: state.winner,
    initNewGame: state.initNewGame,
  }))

  const handleButtonClick = () => {
    initNewGame()
  }

  return (
    <div className={styles.container}>
      {winner && <h1 className={styles.title}>Победил {winner}!</h1>}
      <button onClick={handleButtonClick} className={styles.btn}>
        {isStartGame ? 'Рестарт игры' : 'Начать игру'}
      </button>
      {!winner && (
        <div className={styles.tables}>
          <Drawing isBot={false} map={botMap} />
          <Drawing isBot={true} map={playerMap} />
        </div>
      )}
      {/* {winner ? (
        <h1 className={styles.title}>Победил {winner}!</h1>
      ) : (
        <div className={styles.tables}>
          <Drawing isBot={false} map={botMap} />
          <Drawing isBot={true} map={playerMap} />
        </div>
      )} */}
    </div>
  )
}

export default App

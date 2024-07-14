import { FC, useEffect } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'
import useGameStore from '../../store/store'

const App: FC = () => {
  const { playerMap, botMap, isStartGame, winner, initNewGame, onPlaySound } = useGameStore(
    (state) => ({
      playerMap: state.playerMap,
      botMap: state.botMap,
      playerShips: state.playerShips,
      botShips: state.botShips,
      isStartGame: state.isStartGame,
      winner: state.winner,
      initNewGame: state.initNewGame,
      onPlaySound: state.onPlaySound,
    }),
  )

  const handleButtonClick = () => {
    initNewGame()
    onPlaySound('menu-button')
  }

  useEffect(() => {
    onPlaySound('menu-button')
  }, [onPlaySound])

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <button onClick={handleButtonClick} className={styles.btn}>
          {isStartGame ? 'Рестарт игры' : 'Начать игру'}
        </button>
      </nav>
      <main className={styles.main}>
        {winner ? (
          <h1 className={styles.title}>Победил {winner}!</h1>
        ) : (
          <div className={styles.tables}>
            <Drawing isBot={false} map={botMap} />
            <Drawing isBot={true} map={playerMap} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

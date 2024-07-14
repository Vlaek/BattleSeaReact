import { FC } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'
import useGameStore from '../../store/store'
import { playSound } from '../../constants'

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
    playSound('menu-button')
  }

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

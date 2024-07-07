import { FC, useState } from 'react'
import Drawing from '../Drawing/Drawing'
import styles from './App.module.css'

const App: FC = () => {
  const [isStartGame, setIsStartGame] = useState<boolean>(false)
  const [isNewGame, setIsNewGame] = useState<boolean>(false)

  const handleButtonClick = () => {
    setIsStartGame(true)
    setIsNewGame(true)
  }

  return (
    <div className={styles.container}>
      <button onClick={handleButtonClick} className={styles.btn}>
        {isStartGame ? 'Рестарт игры' : 'Начать игру'}
      </button>
      <div className={styles.tables}>
        <Drawing
          isBot={false}
          isNewGame={isNewGame}
          isStartGame={isStartGame}
          onStartGame={setIsStartGame}
          setIsNewGame={setIsNewGame}
        />
        <Drawing
          isBot={true}
          isNewGame={isNewGame}
          isStartGame={isStartGame}
          onStartGame={setIsStartGame}
          setIsNewGame={setIsNewGame}
        />
      </div>
    </div>
  )
}

export default App

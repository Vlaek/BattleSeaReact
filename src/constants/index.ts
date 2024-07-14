const BATTLE_SIZE = 10
const INITIAL_SHIPS: number[] = [0, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
const INITIAL_MAP: number[][] = Array.from({ length: BATTLE_SIZE }, () =>
  Array(BATTLE_SIZE).fill(0),
)
const PLAYER_NAME = 'Игрок'
const BOT_NAME = 'Бот'

const SHOT_TIME = 1000

type SoundNameType = 'shot' | 'explosion' | 'water' | 'lose' | 'win' | 'menu-button'

const playSound = (soundName: SoundNameType): void => {
  const audioContext = new AudioContext()
  const source = audioContext.createBufferSource()

  fetch(`./sounds/${soundName}.mp3`)
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer))
    .then((decodedData) => {
      source.buffer = decodedData
      source.connect(audioContext.destination)
      source.start()
    })
    .catch((error) => console.error('Error loading sound:', error))
}

export { BATTLE_SIZE, INITIAL_SHIPS, INITIAL_MAP, PLAYER_NAME, BOT_NAME, SHOT_TIME, playSound }

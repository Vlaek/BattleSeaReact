const BATTLE_SIZE = 10
const INITIAL_SHIPS: number[] = [0, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
const INITIAL_MAP: number[][] = Array.from({ length: BATTLE_SIZE }, () =>
  Array(BATTLE_SIZE).fill(0),
)
const PLAYER_NAME = 'Игрок'
const BOT_NAME = 'Бот'

const SHOT_TIME = 1000

export { BATTLE_SIZE, INITIAL_SHIPS, INITIAL_MAP, PLAYER_NAME, BOT_NAME, SHOT_TIME }

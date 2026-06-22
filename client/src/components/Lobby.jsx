import { useState } from 'react'

const DIFFICULTIES = [
  { key: 'easy', label: 'Лёгкий', desc: 'Случайные ходы' },
  { key: 'medium', label: 'Средний', desc: 'Думает на 2 хода вперёд' },
  { key: 'hard', label: 'Профессионал', desc: 'Думает на 3 хода, оценивает позицию' },
]

export default function Lobby({ onCreateRoom, onJoinRoom, onPlayBot, error }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState(null)

  const nameOk = playerName.trim().length > 0

  function handleCreate(e) {
    e.preventDefault()
    if (nameOk) onCreateRoom(playerName.trim())
  }

  function handleJoin(e) {
    e.preventDefault()
    if (nameOk && roomCode.trim()) onJoinRoom(playerName.trim(), roomCode.trim())
  }

  function handleBotDifficulty(difficulty) {
    const color = Math.random() < 0.5 ? 'white' : 'black'
    onPlayBot({ difficulty, playerColor: color, playerName: playerName.trim() || 'Игрок' })
  }

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h1 className="lobby-title">♟ Chess Online</h1>
        <p className="lobby-subtitle">Шахматы в реальном времени</p>

        <div className="lobby-form">
          <input
            className="input"
            type="text"
            placeholder="Ваше имя"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={20}
            autoFocus
          />

          {error && <p className="error-msg">{error}</p>}

          {!mode && (
            <div className="lobby-actions">
              <button className="btn btn-primary" onClick={() => setMode('create')} disabled={!nameOk}>
                Создать игру
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('join')} disabled={!nameOk}>
                Войти по коду
              </button>
              <button className="btn btn-ghost" onClick={() => setMode('bot')} disabled={!nameOk}>
                Играть против бота
              </button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="mode-form">
              <p className="mode-hint">Создайте комнату и поделитесь кодом с другом. Цвет определится после игры в Камень-Ножницы-Бумага.</p>
              <div className="form-row">
                <button type="submit" className="btn btn-primary">Создать комнату</button>
                <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>Назад</button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="mode-form">
              <input
                className="input"
                type="text"
                placeholder="Код комнаты (6 символов)"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toLowerCase())}
                maxLength={6}
                autoFocus
              />
              <div className="form-row">
                <button type="submit" className="btn btn-primary" disabled={roomCode.trim().length !== 6}>
                  Войти
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>Назад</button>
              </div>
            </form>
          )}

          {mode === 'bot' && (
            <div className="mode-form">
              <p className="mode-hint">Выберите сложность:</p>
              <div className="difficulty-list">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.key}
                    className="btn btn-difficulty"
                    onClick={() => handleBotDifficulty(d.key)}
                  >
                    <span className="diff-label">{d.label}</span>
                    <span className="diff-desc">{d.desc}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>Назад</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

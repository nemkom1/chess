import { useState } from 'react'

export default function StatusBar({ gameState, roomInfo, phase, message, onRestart }) {
  const [copied, setCopied] = useState(false)

  if (!gameState || !roomInfo) return null

  const { turn, status, result } = gameState
  const myColor = roomInfo.color
  const isMyTurn =
    (myColor === 'white' && turn === 'w') ||
    (myColor === 'black' && turn === 'b')
  const isOver = ['checkmate', 'stalemate', 'draw'].includes(status)

  function getStatusText() {
    if (status === 'checkmate') {
      return result === myColor ? '🏆 Вы выиграли! Шах и мат.' : '💀 Вы проиграли. Шах и мат.'
    }
    if (status === 'stalemate') return '🤝 Пат. Ничья.'
    if (status === 'draw') return '🤝 Ничья.'
    if (status === 'check') {
      return isMyTurn ? '⚠️ Вам шах! Ваш ход.' : '⚠️ Противнику шах!'
    }
    return isMyTurn ? '● Ваш ход' : '○ Ход противника'
  }

  function handleCopy() {
    navigator.clipboard.writeText(roomInfo.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const myLabel = myColor === 'white' ? '♔' : '♚'
  const oppColor = myColor === 'white' ? 'black' : 'white'
  const oppLabel = oppColor === 'white' ? '♔' : '♚'

  return (
    <div className="status-bar">
      <div className="status-players">
        <div className="status-player-row">
          <span className={`color-badge badge-${myColor}`}>{myLabel} Вы</span>
          <span className="player-name">{roomInfo.playerName}</span>
        </div>
        <span className="vs-sep">vs</span>
        <div className="status-player-row">
          <span className={`color-badge badge-${oppColor}`}>{oppLabel} Соперник</span>
          <span className="player-name">{roomInfo.opponentName ?? '...'}</span>
        </div>
      </div>

      <div className={`status-text status-${status}`}>{getStatusText()}</div>

      <div className="status-right">
        {message && <span className="status-error">{message}</span>}
        <button className="room-code-btn" onClick={handleCopy} title="Нажмите чтобы скопировать">
          <span className="room-code-label">Код:</span>
          <span className="room-code-val">{roomInfo.roomCode}</span>
          <span className="room-code-copy">{copied ? '✓' : '⎘'}</span>
        </button>
        {isOver && (
          <button className="btn btn-secondary" onClick={onRestart}>
            Новая игра
          </button>
        )}
      </div>
    </div>
  )
}

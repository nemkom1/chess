import { useState } from 'react'

export default function StatusBar({ gameState, roomInfo, phase, message, onRestart }) {
  const [copied, setCopied] = useState(false)

  if (!gameState || !roomInfo) return null

  const { turn, status, result } = gameState
  const myColor = roomInfo.color
  const oppColor = myColor === 'white' ? 'black' : 'white'
  const isMyTurn = (myColor === 'white' && turn === 'w') || (myColor === 'black' && turn === 'b')
  const isOver = ['checkmate', 'stalemate', 'draw'].includes(status)

  function getStatusText() {
    if (status === 'checkmate') return result === myColor ? '🏆 Вы выиграли!' : '💀 Вы проиграли.'
    if (status === 'stalemate') return '🤝 Пат — ничья.'
    if (status === 'draw') return '🤝 Ничья.'
    if (status === 'check') return isMyTurn ? '⚠️ Вам шах! Ваш ход.' : '⚠️ Шах сопернику!'
    return isMyTurn ? '● Ваш ход' : '○ Ход соперника...'
  }

  function handleCopy() {
    navigator.clipboard.writeText(roomInfo.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="status-bar">
      {/* Row 1: players + room code */}
      <div className="status-players-row">
        <div className="sbar-player">
          <span className={`color-dot dot-${myColor}`} />
          <span className="sbar-name">{roomInfo.playerName}</span>
          <span className="sbar-you">(вы)</span>
        </div>
        <span className="sbar-vs">vs</span>
        <div className="sbar-player">
          <span className={`color-dot dot-${oppColor}`} />
          <span className="sbar-name">{roomInfo.opponentName ?? '...'}</span>
        </div>
        <button className="room-code-btn" onClick={handleCopy} title="Скопировать код комнаты">
          {roomInfo.roomCode}&nbsp;{copied ? '✓' : '⎘'}
        </button>
      </div>
      {/* Row 2: game status */}
      <div className="status-game-row">
        <span className={`status-text status-${status}`}>{getStatusText()}</span>
        <div className="status-actions">
          {message && <span className="status-error">{message}</span>}
          {isOver && (
            <button className="btn-small btn-restart" onClick={onRestart}>Новая игра</button>
          )}
        </div>
      </div>
    </div>
  )
}

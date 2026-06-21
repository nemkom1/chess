export default function StatusBar({ gameState, roomInfo, phase, message, onRestart }) {
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

  const colorLabel = myColor === 'white' ? '♔ Белые' : '♚ Чёрные'

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className={`color-badge badge-${myColor}`}>{colorLabel}</span>
        <span className="player-name">{roomInfo.playerName}</span>
      </div>
      <div className={`status-text status-${status}`}>{getStatusText()}</div>
      <div className="status-right">
        {message && <span className="status-error">{message}</span>}
        {isOver && (
          <button className="btn btn-secondary" onClick={onRestart}>
            Новая игра
          </button>
        )}
      </div>
    </div>
  )
}

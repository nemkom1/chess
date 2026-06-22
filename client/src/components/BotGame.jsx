import { useState, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { getBotMove } from '../utils/chessBot'
import Board from './Board'
import MoveHistory from './MoveHistory'

const DIFFICULTY_LABELS = { easy: 'Лёгкий', medium: 'Средний', hard: 'Профессионал' }
const BOT_DELAY = { easy: 400, medium: 700, hard: 1200 }

function getStatus(chess) {
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isStalemate()) return 'stalemate'
  if (chess.isDraw()) return 'draw'
  if (chess.inCheck()) return 'check'
  return 'playing'
}

export default function BotGame({ difficulty, playerColor, onExit }) {
  const chessRef = useRef(new Chess())
  const [fen, setFen] = useState(() => chessRef.current.fen())
  const [turn, setTurn] = useState('w')
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('playing')
  const [thinking, setThinking] = useState(false)
  const thinkingRef = useRef(false)

  const chess = chessRef.current
  const botColor = playerColor === 'white' ? 'black' : 'white'
  const isOver = ['checkmate', 'stalemate', 'draw'].includes(status)

  function syncState() {
    setFen(chess.fen())
    setTurn(chess.turn())
    setHistory(chess.history())
    setStatus(getStatus(chess))
  }

  function handleMove(from, to) {
    if (isOver || thinking) return
    try {
      chess.move({ from, to, promotion: 'q' })
    } catch {
      return
    }
    syncState()
  }

  function handleRestart() {
    chess.reset()
    syncState()
    setThinking(false)
    thinkingRef.current = false
  }

  // Bot makes a move when it's its turn
  useEffect(() => {
    const isBotTurn = (botColor === 'white' && turn === 'w') || (botColor === 'black' && turn === 'b')
    if (!isBotTurn || isOver || thinkingRef.current) return

    thinkingRef.current = true
    setThinking(true)

    const timeout = setTimeout(() => {
      const move = getBotMove(chess.fen(), difficulty)
      if (move) {
        try { chess.move(move) } catch {}
        syncState()
      }
      thinkingRef.current = false
      setThinking(false)
    }, BOT_DELAY[difficulty])

    return () => {
      clearTimeout(timeout)
      thinkingRef.current = false
    }
  }, [turn, isOver, botColor, difficulty])

  const isMyTurn = (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b')
  const colorLabel = playerColor === 'white' ? '♔ Белые' : '♚ Чёрные'

  function getStatusText() {
    if (status === 'checkmate') {
      const winner = chess.turn() === 'w' ? 'black' : 'white'
      return winner === playerColor ? '🏆 Вы выиграли!' : '💀 Бот победил!'
    }
    if (status === 'stalemate') return '🤝 Пат. Ничья.'
    if (status === 'draw') return '🤝 Ничья.'
    if (thinking) return `🤖 Бот думает...`
    if (status === 'check') return isMyTurn ? '⚠️ Вам шах! Ваш ход.' : '⚠️ Шах боту!'
    return isMyTurn ? '● Ваш ход' : '○ Бот ходит...'
  }

  return (
    <div className="game-layout">
      <div className="game-main">
        <div className="status-bar">
          <div className="status-left">
            <span className={`color-badge badge-${playerColor}`}>{colorLabel}</span>
            <span className="player-name">vs Бот · {DIFFICULTY_LABELS[difficulty]}</span>
          </div>
          <div className={`status-text status-${status}`}>{getStatusText()}</div>
          <div className="status-right">
            {isOver && (
              <button className="btn btn-secondary" onClick={handleRestart}>
                Заново
              </button>
            )}
            <button className="btn btn-ghost" onClick={onExit}>Выйти</button>
          </div>
        </div>
        <Board
          fen={fen}
          playerColor={playerColor}
          currentTurn={turn}
          onMove={handleMove}
          status={status}
        />
      </div>
      <MoveHistory history={history} />
    </div>
  )
}

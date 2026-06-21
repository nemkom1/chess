import { useState, useEffect } from 'react'
import { socket } from './socket'
import Lobby from './components/Lobby'
import Board from './components/Board'
import StatusBar from './components/StatusBar'
import MoveHistory from './components/MoveHistory'

export default function App() {
  const [phase, setPhase] = useState('lobby')
  const [roomInfo, setRoomInfo] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    socket.on('room:created', ({ roomCode, color }) => {
      setRoomInfo(prev => ({ ...prev, roomCode, color }))
      setPhase('waiting')
    })

    socket.on('room:joined', ({ roomCode, color }) => {
      setRoomInfo(prev => ({ ...prev, roomCode, color }))
    })

    socket.on('room:ready', ({ fen, turn }) => {
      setGameState({ fen, turn, history: [], status: 'playing' })
      setPhase('playing')
    })

    socket.on('room:error', ({ message }) => {
      setMessage(message)
      setTimeout(() => setMessage(null), 3000)
    })

    socket.on('move:update', ({ fen, history, turn, status }) => {
      setGameState({ fen, turn, history, status })
    })

    socket.on('move:invalid', ({ message }) => {
      setMessage(message)
      setTimeout(() => setMessage(null), 2000)
    })

    socket.on('game:over', ({ result, reason }) => {
      setPhase('over')
      setGameState(prev => ({ ...prev, result, reason }))
    })

    socket.on('opponent:disconnected', () => {
      setMessage('Противник отключился')
      setPhase('over')
    })

    return () => {
      socket.off('room:created')
      socket.off('room:joined')
      socket.off('room:ready')
      socket.off('room:error')
      socket.off('move:update')
      socket.off('move:invalid')
      socket.off('game:over')
      socket.off('opponent:disconnected')
    }
  }, [])

  function handleCreateRoom(playerName) {
    setRoomInfo({ playerName })
    setMessage(null)
    socket.emit('room:create', { playerName })
  }

  function handleJoinRoom(playerName, roomCode) {
    setRoomInfo({ playerName })
    setMessage(null)
    socket.emit('room:join', { roomCode: roomCode.toLowerCase(), playerName })
  }

  function handleMove(from, to) {
    if (!roomInfo) return
    socket.emit('move:attempt', { roomCode: roomInfo.roomCode, from, to, promotion: 'q' })
  }

  function handleRestart() {
    setPhase('lobby')
    setRoomInfo(null)
    setGameState(null)
    setMessage(null)
  }

  if (phase === 'lobby') {
    return <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={message} />
  }

  if (phase === 'waiting') {
    return (
      <div className="waiting-screen">
        <div className="waiting-card">
          <h2>Ожидание противника...</h2>
          <p>Поделитесь кодом с другом:</p>
          <div className="room-code-display">
            <span className="code-text">{roomInfo?.roomCode}</span>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(roomInfo?.roomCode)}
            >
              Копировать
            </button>
          </div>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="game-layout">
      <div className="game-main">
        <StatusBar
          gameState={gameState}
          roomInfo={roomInfo}
          phase={phase}
          message={message}
          onRestart={handleRestart}
        />
        <Board
          fen={gameState?.fen}
          playerColor={roomInfo?.color}
          currentTurn={gameState?.turn}
          onMove={handleMove}
          status={gameState?.status}
        />
      </div>
      <MoveHistory history={gameState?.history || []} />
    </div>
  )
}

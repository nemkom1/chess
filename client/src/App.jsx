import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import Lobby from './components/Lobby'
import RPS from './components/RPS'
import Board from './components/Board'
import StatusBar from './components/StatusBar'
import MoveHistory from './components/MoveHistory'
import BotGame from './components/BotGame'

export default function App() {
  const [phase, setPhase] = useState('lobby')
  const [roomInfo, setRoomInfo] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [message, setMessage] = useState(null)
  const [rpsState, setRpsState] = useState(null)
  const [botConfig, setBotConfig] = useState(null)

  // Ref to access latest roomInfo/phase in reconnect handler without stale closure
  const roomInfoRef = useRef(null)
  const phaseRef = useRef('lobby')
  roomInfoRef.current = roomInfo
  phaseRef.current = phase

  useEffect(() => {
    socket.on('room:created', ({ roomCode }) => {
      setRoomInfo(prev => ({ ...prev, roomCode }))
      setPhase('waiting')
    })

    socket.on('room:joined', ({ roomCode }) => {
      setRoomInfo(prev => ({ ...prev, roomCode }))
      setPhase('waiting')
    })

    socket.on('rps:start', () => {
      setPhase('rps')
      setRpsState({ type: 'choosing' })
    })

    socket.on('rps:draw', ({ choiceA, choiceB }) => {
      setRpsState({ type: 'draw', choiceA, choiceB })
      setTimeout(() => setRpsState({ type: 'choosing' }), 2000)
    })

    socket.on('rps:result', ({ myChoice, opponentChoice, won, color }) => {
      setRpsState({ type: 'result', myChoice, opponentChoice, won, color })
    })

    socket.on('room:ready', ({ fen, turn, color }) => {
      setRoomInfo(prev => ({ playerName: prev?.playerName, roomCode: prev?.roomCode, color }))
      setGameState({ fen, turn, history: [], status: 'playing' })
      setPhase('playing')
      setRpsState(null)
    })

    socket.on('reconnected', ({ roomCode, color, fen, turn, history, status }) => {
      setRoomInfo(prev => ({ ...prev, roomCode, color }))
      setGameState({ fen, turn, history, status })
      const isOver = ['checkmate', 'stalemate', 'draw'].includes(status)
      setPhase(isOver ? 'over' : 'playing')
      setMessage(null)
    })

    socket.on('room:error', ({ message: msg }) => {
      setMessage(msg)
      setTimeout(() => setMessage(null), 3000)
    })

    socket.on('move:update', ({ fen, history, turn, status }) => {
      setGameState({ fen, turn, history, status })
    })

    socket.on('move:invalid', ({ message: msg }) => {
      setMessage(msg)
      setTimeout(() => setMessage(null), 2000)
    })

    socket.on('game:over', ({ result, reason }) => {
      setPhase('over')
      setGameState(prev => ({ ...prev, result, reason }))
    })

    socket.on('opponent:disconnected', () => {
      setMessage('Противник отключился. Он может вернуться, введя код комнаты.')
    })

    socket.on('opponent:reconnected', () => {
      setMessage(null)
    })

    return () => {
      socket.off('room:created')
      socket.off('room:joined')
      socket.off('rps:start')
      socket.off('rps:draw')
      socket.off('rps:result')
      socket.off('room:ready')
      socket.off('reconnected')
      socket.off('room:error')
      socket.off('move:update')
      socket.off('move:invalid')
      socket.off('game:over')
      socket.off('opponent:disconnected')
      socket.off('opponent:reconnected')
    }
  }, [])

  // Auto-rejoin room after socket.io reconnect (new socket ID, same room)
  useEffect(() => {
    function handleConnect() {
      const ri = roomInfoRef.current
      const p = phaseRef.current
      if (ri?.roomCode && ri?.playerName && p !== 'lobby') {
        socket.emit('room:join', { roomCode: ri.roomCode, playerName: ri.playerName })
      }
    }
    socket.on('connect', handleConnect)
    return () => socket.off('connect', handleConnect)
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

  function handlePlayBot(config) {
    setBotConfig(config)
    setPhase('bot')
  }

  function handleRPSChoice(choice) {
    socket.emit('rps:choose', { roomCode: roomInfo.roomCode, choice })
    setRpsState({ type: 'waiting', myChoice: choice })
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
    setRpsState(null)
    setBotConfig(null)
  }

  if (phase === 'lobby') {
    return <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} onPlayBot={handlePlayBot} error={message} />
  }

  if (phase === 'bot') {
    return (
      <BotGame
        difficulty={botConfig.difficulty}
        playerColor={botConfig.playerColor}
        onExit={handleRestart}
      />
    )
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

  if (phase === 'rps') {
    return <RPS rpsState={rpsState} onChoose={handleRPSChoice} />
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

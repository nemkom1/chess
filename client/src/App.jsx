import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import Lobby from './components/Lobby'
import RPS from './components/RPS'
import Board from './components/Board'
import StatusBar from './components/StatusBar'
import MoveHistory from './components/MoveHistory'
import ChatBox from './components/ChatBox'
import BotGame from './components/BotGame'

export default function App() {
  const [phase, setPhase] = useState('lobby')
  const [roomInfo, setRoomInfo] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [message, setMessage] = useState(null)
  const [rpsState, setRpsState] = useState(null)
  const [botConfig, setBotConfig] = useState(null)
  const [chatMessages, setChatMessages] = useState([])

  // Refs for stable access in socket handlers without stale closures
  const roomInfoRef = useRef(null)
  const phaseRef = useRef('lobby')
  roomInfoRef.current = roomInfo
  phaseRef.current = phase

  useEffect(() => {
    function onRoomCreated({ roomCode }) {
      setRoomInfo(prev => ({ ...prev, roomCode }))
      setPhase('waiting')
    }
    function onRoomJoined({ roomCode }) {
      setRoomInfo(prev => ({ ...prev, roomCode }))
      setPhase('waiting')
    }
    function onRpsStart() {
      setPhase('rps')
      setRpsState({ type: 'choosing' })
    }
    function onRpsDraw({ choiceA, choiceB }) {
      setRpsState({ type: 'draw', choiceA, choiceB })
      setTimeout(() => setRpsState({ type: 'choosing' }), 2000)
    }
    function onRpsResult({ myChoice, opponentChoice, won, color }) {
      setRpsState({ type: 'result', myChoice, opponentChoice, won, color })
    }
    function onRoomReady({ fen, turn, color, opponentName }) {
      setRoomInfo(prev => ({ playerName: prev?.playerName, roomCode: prev?.roomCode, color, opponentName }))
      setGameState({ fen, turn, history: [], status: 'playing' })
      setChatMessages([])
      setPhase('playing')
      setRpsState(null)
    }
    function onReconnected({ roomCode, color, fen, turn, history, status, opponentName }) {
      setRoomInfo(prev => ({ ...prev, roomCode, color, opponentName }))
      setGameState({ fen, turn, history, status })
      const isOver = ['checkmate', 'stalemate', 'draw'].includes(status)
      setPhase(isOver ? 'over' : 'playing')
      setMessage(null)
    }
    function onRoomError({ message: msg }) {
      // If we got "room not found" while in-game — the room expired, reset to lobby
      if (msg === 'Комната не найдена' && phaseRef.current !== 'lobby') {
        setPhase('lobby')
        setRoomInfo(null)
        setGameState(null)
        setChatMessages([])
      }
      setMessage(msg)
      setTimeout(() => setMessage(null), 3000)
    }
    function onMoveUpdate({ fen, history, turn, status }) {
      setGameState({ fen, turn, history, status })
    }
    function onMoveInvalid({ message: msg }) {
      setMessage(msg)
      setTimeout(() => setMessage(null), 2000)
    }
    function onGameOver({ result, reason }) {
      setPhase('over')
      setGameState(prev => ({ ...prev, result, reason }))
    }
    function onOpponentDisconnected() {
      setMessage('Противник отключился. Он может вернуться, введя код комнаты.')
    }
    function onOpponentReconnected() {
      setMessage(null)
    }
    function onChatMessage({ senderName, text }) {
      setChatMessages(prev => [...prev, { senderName, text }])
    }

    socket.on('room:created', onRoomCreated)
    socket.on('room:joined', onRoomJoined)
    socket.on('rps:start', onRpsStart)
    socket.on('rps:draw', onRpsDraw)
    socket.on('rps:result', onRpsResult)
    socket.on('room:ready', onRoomReady)
    socket.on('reconnected', onReconnected)
    socket.on('room:error', onRoomError)
    socket.on('move:update', onMoveUpdate)
    socket.on('move:invalid', onMoveInvalid)
    socket.on('game:over', onGameOver)
    socket.on('opponent:disconnected', onOpponentDisconnected)
    socket.on('opponent:reconnected', onOpponentReconnected)
    socket.on('chat:message', onChatMessage)

    return () => {
      socket.off('room:created', onRoomCreated)
      socket.off('room:joined', onRoomJoined)
      socket.off('rps:start', onRpsStart)
      socket.off('rps:draw', onRpsDraw)
      socket.off('rps:result', onRpsResult)
      socket.off('room:ready', onRoomReady)
      socket.off('reconnected', onReconnected)
      socket.off('room:error', onRoomError)
      socket.off('move:update', onMoveUpdate)
      socket.off('move:invalid', onMoveInvalid)
      socket.off('game:over', onGameOver)
      socket.off('opponent:disconnected', onOpponentDisconnected)
      socket.off('opponent:reconnected', onOpponentReconnected)
      socket.off('chat:message', onChatMessage)
    }
  }, [])

  // Auto-rejoin room after socket.io reconnect (new socket ID, same room)
  useEffect(() => {
    function handleConnect() {
      const ri = roomInfoRef.current
      const p = phaseRef.current
      if (ri?.roomCode && ri?.playerName && p !== 'lobby' && p !== 'bot') {
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

  function handleChatSend(text) {
    if (!roomInfo?.roomCode) return
    socket.emit('chat:message', { roomCode: roomInfo.roomCode, text })
  }

  function handleRestart() {
    setPhase('lobby')
    setRoomInfo(null)
    setGameState(null)
    setMessage(null)
    setRpsState(null)
    setBotConfig(null)
    setChatMessages([])
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
      <div className="game-sidebar">
        <MoveHistory history={gameState?.history || []} />
        <ChatBox
          messages={chatMessages}
          onSend={handleChatSend}
          playerName={roomInfo?.playerName}
        />
      </div>
    </div>
  )
}

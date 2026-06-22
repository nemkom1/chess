const { createRoom, joinRoom, getRoom, getRoomBySocketId, markDisconnected, assignColors, deleteRoom } = require('./roomManager')

function getGameStatus(chess) {
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isStalemate()) return 'stalemate'
  if (chess.isDraw()) return 'draw'
  if (chess.inCheck()) return 'check'
  return 'playing'
}

const RPS_BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' }

function resolveRPS(choiceA, choiceB) {
  if (choiceA === choiceB) return 'draw'
  return RPS_BEATS[choiceA] === choiceB ? 'a' : 'b'
}

function registerHandlers(io, socket) {
  socket.on('room:create', ({ playerName }) => {
    if (typeof playerName !== 'string' || !playerName.trim() || playerName.length > 30) return
    const code = createRoom(socket.id, playerName.trim())
    socket.join(code)
    socket.emit('room:created', { roomCode: code })
    console.log(`Room ${code} created by ${playerName}`)
  })

  socket.on('room:join', ({ roomCode, playerName }) => {
    if (typeof roomCode !== 'string' || typeof playerName !== 'string' || !playerName.trim()) return
    const code = roomCode.toLowerCase()
    const result = joinRoom(code, socket.id, playerName)

    if (result.error) {
      socket.emit('room:error', { message: result.error })
      return
    }

    const { room, reconnected, player } = result
    socket.join(code)

    if (reconnected) {
      const { chess } = room
      const status = getGameStatus(chess)
      socket.emit('reconnected', {
        roomCode: code,
        color: player.color,
        fen: chess.fen(),
        turn: chess.turn(),
        history: chess.history(),
        status
      })
      socket.to(code).emit('opponent:reconnected')
      console.log(`${playerName} reconnected to room ${code}`)
      return
    }

    socket.emit('room:joined', { roomCode: code })

    if (room.players.length === 2) {
      io.to(code).emit('rps:start')
      console.log(`RPS started in room ${code}`)
    }
  })

  socket.on('rps:choose', ({ roomCode, choice }) => {
    if (!['rock', 'paper', 'scissors'].includes(choice)) return
    const code = roomCode.toLowerCase()
    const room = getRoom(code)
    if (!room) return

    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) return

    if (room.rps[socket.id]) return  // уже выбрал — игнорируем double-click
    room.rps[socket.id] = choice

    const ids = Object.keys(room.rps)
    if (ids.length < 2) return

    const [idA, idB] = ids
    const choiceA = room.rps[idA]
    const choiceB = room.rps[idB]
    room.rps = {}

    const result = resolveRPS(choiceA, choiceB)

    if (result === 'draw') {
      io.to(code).emit('rps:draw', { choiceA, choiceB })
      return
    }

    const winnerSocketId = result === 'a' ? idA : idB
    assignColors(code, winnerSocketId)

    room.players.forEach(p => {
      const myChoice = p.socketId === idA ? choiceA : choiceB
      const opponentChoice = p.socketId === idA ? choiceB : choiceA
      io.to(p.socketId).emit('rps:result', {
        myChoice,
        opponentChoice,
        won: p.color === 'white',
        color: p.color
      })
    })

    setTimeout(() => {
      const { chess } = room
      room.players.forEach(p => {
        io.to(p.socketId).emit('room:ready', {
          fen: chess.fen(),
          turn: chess.turn(),
          color: p.color
        })
      })
    }, 2000)
  })

  socket.on('move:attempt', ({ roomCode, from, to, promotion }) => {
    const room = getRoom(roomCode?.toLowerCase())
    if (!room) return

    const player = room.players.find(p => p.socketId === socket.id)
    if (!player) return

    const expectedColor = room.chess.turn() === 'w' ? 'white' : 'black'
    if (player.color !== expectedColor) {
      socket.emit('move:invalid', { message: 'Не ваш ход' })
      return
    }

    let moveResult
    try {
      moveResult = room.chess.move({ from, to, promotion: promotion || 'q' })
    } catch {
      moveResult = null
    }

    if (!moveResult) {
      socket.emit('move:invalid', { message: 'Недопустимый ход' })
      return
    }

    const status = getGameStatus(room.chess)
    const payload = {
      fen: room.chess.fen(),
      move: moveResult.san,
      history: room.chess.history(),
      turn: room.chess.turn(),
      status
    }

    const lowerCode = roomCode?.toLowerCase()
    io.to(lowerCode).emit('move:update', payload)

    if (status === 'checkmate' || status === 'stalemate' || status === 'draw') {
      const result = status === 'checkmate' ? player.color : 'draw'
      io.to(lowerCode).emit('game:over', { result, reason: status })
      setTimeout(() => deleteRoom(lowerCode), 60000) // чистим через 1 мин
    }
  })

  socket.on('disconnect', () => {
    const entry = getRoomBySocketId(socket.id)
    if (entry) {
      markDisconnected(socket.id)
      socket.to(entry.code).emit('opponent:disconnected')
    }
  })
}

module.exports = { registerHandlers }

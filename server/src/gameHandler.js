const { createRoom, joinRoom, getRoom, getRoomBySocketId, removePlayerFromRoom } = require('./roomManager')

function getGameStatus(chess) {
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isStalemate()) return 'stalemate'
  if (chess.isDraw()) return 'draw'
  if (chess.inCheck()) return 'check'
  return 'playing'
}

function registerHandlers(io, socket) {
  socket.on('room:create', ({ playerName }) => {
    const code = createRoom(socket.id, playerName)
    socket.join(code)
    socket.emit('room:created', { roomCode: code, color: 'white' })
    console.log(`Room ${code} created by ${playerName}`)
  })

  socket.on('room:join', ({ roomCode, playerName }) => {
    const code = roomCode.toLowerCase()
    const result = joinRoom(code, socket.id, playerName)

    if (result.error) {
      socket.emit('room:error', { message: result.error })
      return
    }

    socket.join(code)
    socket.emit('room:joined', { roomCode: code, color: 'black' })

    const { chess } = result.room
    io.to(code).emit('room:ready', { fen: chess.fen(), turn: chess.turn() })
    console.log(`${playerName} joined room ${code}`)
  })

  socket.on('move:attempt', ({ roomCode, from, to, promotion }) => {
    const room = getRoom(roomCode)
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

    io.to(roomCode).emit('move:update', payload)

    if (status === 'checkmate' || status === 'stalemate' || status === 'draw') {
      let result, reason
      if (status === 'checkmate') {
        result = player.color
        reason = 'checkmate'
      } else {
        result = 'draw'
        reason = status
      }
      io.to(roomCode).emit('game:over', { result, reason })
    }
  })

  socket.on('disconnect', () => {
    const entry = getRoomBySocketId(socket.id)
    if (entry) {
      removePlayerFromRoom(socket.id)
      socket.to(entry.code).emit('opponent:disconnected')
    }
  })
}

module.exports = { registerHandlers }

const { Chess } = require('chess.js')
const crypto = require('crypto')

const rooms = new Map()

function generateCode() {
  return crypto.randomBytes(3).toString('hex')
}

function createRoom(socketId, playerName) {
  let code
  do {
    code = generateCode()
  } while (rooms.has(code))

  rooms.set(code, {
    players: [{ socketId, name: playerName, color: null, connected: true }],
    chess: new Chess(),
    rps: {}
  })
  return code
}

function joinRoom(code, socketId, playerName) {
  const room = rooms.get(code)
  if (!room) return { error: 'Комната не найдена' }

  if (room.players.length >= 2) {
    const disconnected = room.players.find(p => p.name === playerName && !p.connected)
    if (disconnected) {
      disconnected.socketId = socketId
      disconnected.connected = true
      return { room, reconnected: true, player: disconnected }
    }
    return { error: 'Комната уже заполнена' }
  }

  const player = { socketId, name: playerName, color: null, connected: true }
  room.players.push(player)
  return { room, reconnected: false, player }
}

function getRoom(code) {
  return rooms.get(code)
}

function getRoomBySocketId(socketId) {
  for (const [code, room] of rooms.entries()) {
    if (room.players.some(p => p.socketId === socketId)) {
      return { code, room }
    }
  }
  return null
}

function markDisconnected(socketId) {
  for (const [code, room] of rooms.entries()) {
    const player = room.players.find(p => p.socketId === socketId)
    if (player) {
      player.connected = false
      return { code, room, player }
    }
  }
  return null
}

function assignColors(code, winnerSocketId) {
  const room = rooms.get(code)
  if (!room) return
  room.players.forEach(p => {
    p.color = p.socketId === winnerSocketId ? 'white' : 'black'
  })
}

module.exports = { createRoom, joinRoom, getRoom, getRoomBySocketId, markDisconnected, assignColors }

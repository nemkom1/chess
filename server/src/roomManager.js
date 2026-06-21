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
    players: [{ socketId, name: playerName, color: 'white' }],
    chess: new Chess()
  })
  return code
}

function joinRoom(code, socketId, playerName) {
  const room = rooms.get(code)
  if (!room) return { error: 'Комната не найдена' }
  if (room.players.length >= 2) return { error: 'Комната уже заполнена' }

  room.players.push({ socketId, name: playerName, color: 'black' })
  return { room }
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

function removePlayerFromRoom(socketId) {
  for (const [code, room] of rooms.entries()) {
    const idx = room.players.findIndex(p => p.socketId === socketId)
    if (idx !== -1) {
      room.players.splice(idx, 1)
      if (room.players.length === 0) rooms.delete(code)
      return code
    }
  }
  return null
}

module.exports = { createRoom, joinRoom, getRoom, getRoomBySocketId, removePlayerFromRoom }

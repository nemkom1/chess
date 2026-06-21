const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { registerHandlers } = require('./gameHandler')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`)
  registerHandlers(io, socket)
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Chess server running on port ${PORT}`)
})

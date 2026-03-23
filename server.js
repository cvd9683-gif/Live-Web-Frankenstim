const express = require('express')
const http    = require('http')
const { Server } = require('socket.io')
const path    = require('path')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server)

app.use(express.static(path.join(__dirname, 'public')))

// rooms:   Map<roomId, Map<socketId, { id, name, joinOrder }>>
// volumes: Map<roomId, Map<socketId, number>>   — last reported volume (0‑1)
// phases:  Map<roomId, { phase:'lobby'|'franken', endsAt:number, cast:[] }>
const rooms   = new Map()
const volumes = new Map()
const phases  = new Map()
let globalJoinCounter = 0

const LOBBY_MS   = 10_000
const FRANKEN_MS = 30_000
const ROLES      = ['FOREHEAD', 'LEFT_EYE', 'RIGHT_EYE', 'NOSE', 'MOUTH']

// ── Phase helpers ─────────────────────────────────────────────────────────────

function topFiveCast(room) {
  const roster  = rooms.get(room)
  const volMap  = volumes.get(room) || new Map()
  if (!roster) return []

  return Array.from(roster.values())
    .sort((a, b) => (volMap.get(b.id) || 0) - (volMap.get(a.id) || 0))
    .slice(0, 5)
    .map((p, i) => ({ id: p.id, name: p.name, role: ROLES[i] }))
}

function startLobby(room) {
  const endsAt    = Date.now() + LOBBY_MS
  const roomSocks = io.sockets.adapter.rooms.get(room)
  const sockCount = roomSocks ? roomSocks.size : 0
  phases.set(room, { phase: 'lobby', endsAt, cast: [] })
  io.to(room).emit('phase', { phase: 'lobby', endsAt, cast: [] })
  console.log(`[${room}] LOBBY phase → emitting to ${sockCount} socket(s), endsAt=${new Date(endsAt).toISOString()}`)
  setTimeout(() => {
    if (rooms.has(room)) startFranken(room)
    else console.log(`[${room}] LOBBY timer fired but room gone — skipping FRANKEN`)
  }, LOBBY_MS)
}

function startFranken(room) {
  const cast      = topFiveCast(room)
  const endsAt    = Date.now() + FRANKEN_MS
  const roomSocks = io.sockets.adapter.rooms.get(room)
  const sockCount = roomSocks ? roomSocks.size : 0
  phases.set(room, { phase: 'franken', endsAt, cast })
  io.to(room).emit('phase', { phase: 'franken', endsAt, cast })
  console.log(`[${room}] FRANKEN phase → emitting to ${sockCount} socket(s), cast=[${cast.map(c => c.name).join(', ')}], endsAt=${new Date(endsAt).toISOString()}`)
  setTimeout(() => {
    if (rooms.has(room)) startLobby(room)
    else console.log(`[${room}] FRANKEN timer fired but room gone — skipping LOBBY`)
  }, FRANKEN_MS)
}

// ── Socket events ─────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  let currentRoom = null
  let userName    = null

  socket.on('join-room', ({ room, name }) => {
    currentRoom = room
    userName    = name

    socket.join(room)

    if (!rooms.has(room))   rooms.set(room, new Map())
    if (!volumes.has(room)) volumes.set(room, new Map())

    const joinOrder = ++globalJoinCounter
    rooms.get(room).set(socket.id, { id: socket.id, name, joinOrder })

    // Send existing participants + current phase (if any) to new joiner
    const existing = Array.from(rooms.get(room).values())
      .filter(p => p.id !== socket.id)
      .sort((a, b) => a.joinOrder - b.joinOrder)

    const currentPhase = phases.get(room) || null

    socket.emit('room-state', {
      participants: existing,
      yourId: socket.id,
      phase: currentPhase
    })

    socket.to(room).emit('user-joined', { id: socket.id, name, joinOrder })

    console.log(`[${room}] ${name} joined (${rooms.get(room).size} total)`)

    // Start phase loop when first person joins
    if (rooms.get(room).size === 1) startLobby(room)
  })

  socket.on('volume-report', ({ volume }) => {
    if (currentRoom && volumes.has(currentRoom)) {
      volumes.get(currentRoom).set(socket.id, volume)
    }
  })

  // WebRTC signaling relay
  socket.on('offer',         ({ to, offer })      => io.to(to).emit('offer',         { from: socket.id, offer }))
  socket.on('answer',        ({ to, answer })     => io.to(to).emit('answer',        { from: socket.id, answer }))
  socket.on('ice-candidate', ({ to, candidate })  => io.to(to).emit('ice-candidate', { from: socket.id, candidate }))

  socket.on('disconnect', () => {
    if (!currentRoom || !rooms.has(currentRoom)) return
    rooms.get(currentRoom).delete(socket.id)
    if (volumes.has(currentRoom)) volumes.get(currentRoom).delete(socket.id)
    const remaining = rooms.get(currentRoom).size
    if (remaining === 0) {
      rooms.delete(currentRoom)
      volumes.delete(currentRoom)
      phases.delete(currentRoom)
    }
    io.to(currentRoom).emit('user-left', { id: socket.id })
    console.log(`[${currentRoom}] ${userName} left (${remaining} remaining)`)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`FrankenFace server running at http://0.0.0.0:${PORT}`)
})

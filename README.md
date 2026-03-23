# FrankenStim

FrankenStim is a real-time, multi-user webcam experience where participants join a shared room and become parts of a single composite face.

Users begin as independent floating video tiles in a chaotic lobby. Through a synchronized phase system, these tiles transform into a collective “Frankenface,” where each participant contributes a fragment of a shared identity.

---

## Overview

This project explores real-time interaction, shared presence, and collective identity in digital environments.

Instead of interacting through text or structured interfaces, users participate through movement, camera input, and synchronization. The experience is designed to feel dynamic, slightly chaotic, and emergent.

---

## Features

- Real-time multi-user connection
- Webcam capture using browser APIs
- Physics-based floating lobby system
- Synchronized phase transitions (lobby → countdown → transformation)
- Composite face generation from multiple users
- Server-managed shared state

---

## System Architecture

### Server (Node.js)

The server is responsible for:
- managing rooms and participants
- maintaining shared state
- broadcasting phase transitions
- relaying WebRTC signaling events

### Client (Browser)

Each client:
- captures webcam input (`getUserMedia`)
- connects to the server via sockets
- establishes peer-to-peer video connections
- renders motion and transformation states

---

## How It Works

### Real-Time Synchronization

The server controls the global phase of the experience. Clients listen for updates and transition together.

```js
socket.on('phase', ({ phase, endsAt, cast }) => {
  if (phase === 'lobby') _enterLobby()
  if (phase === 'franken') _enterFranken(cast)
  _startCountdown(endsAt)
})

This ensures all users move through the experience simultaneously.

Room Connection + Signaling

When a user joins, the server:

adds them to a room
sends existing participants
notifies others of the new user

WebRTC signaling is relayed through the server:

socket.on('offer', ({ to, offer }) =>
  io.to(to).emit('offer', { from: socket.id, offer })
)

socket.on('answer', ({ to, answer }) =>
  io.to(to).emit('answer', { from: socket.id, answer })
)

This allows browsers to establish direct peer-to-peer video streams.

Lobby Motion System

In the lobby phase, each video tile behaves like a simple physics object:

random velocity → movement
drag → smooth motion
speed cap → stability
boundary collision → keeps tiles on screen
this.vx += (Math.random() - 0.5) * 0.42
this.vy += (Math.random() - 0.5) * 0.42

this.vx *= 0.997
this.vy *= 0.997

this.x += this.vx
this.y += this.vy

This creates a controlled, dynamic environment.

Face Assembly (Frankenface)

During the transformation phase, users are assigned facial regions. Each video stream is cropped and mapped into a predefined layout.

const BASE_BANDS = {
  FOREHEAD: { x: 0.00, y: 0.00, w: 1.00, h: 0.22 },
  LEFT_EYE: { x: 0.00, y: 0.17, w: 0.52, h: 0.31 },
  RIGHT_EYE:{ x: 0.48, y: 0.18, w: 0.52, h: 0.30 },
  NOSE:     { x: 0.08, y: 0.44, w: 0.84, h: 0.20 },
  MOUTH:    { x: 0.04, y: 0.60, w: 0.92, h: 0.24 }
}

The result is a composite face built from multiple participants.

Installation
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/frankenstim.git
cd frankenstim
2. Install dependencies
npm install
3. Start the server
npm start

Server runs at:

http://0.0.0.0:3000
Running Locally

Open in your browser:

http://localhost:3000
Running a Live Demo

To connect multiple devices, expose the server using a tunnel.

Cloudflare Tunnel (recommended)
brew install cloudflared
cloudflared tunnel --url http://localhost:3000

This generates a public HTTPS URL.

ngrok
ngrok http 3000
Usage
Open the app in a browser
Enable camera access
Join the shared room
Experience:
floating lobby interaction
synchronized countdown
transformation into Frankenface
Technical Stack
Node.js
WebRTC (getUserMedia)
Socket-based communication
Vanilla JavaScript
Canvas rendering
Limitations
Requires camera permissions
Best with small groups (5–10 users)
Face alignment is approximate (no tracking)
Performance depends on number of participants
Future Improvements
Face tracking for better alignment
Audio-based interaction (e.g. volume-driven behavior)
Additional transformation modes beyond faces
Improved synchronization and latency handling
Performance optimization for larger groups
License

This project is intended for educational and experimental use. You are free to use, modify, and build upon it.


---

## Why this version is good

- Reads like a **real GitHub project**
- Explains enough for someone to **reuse your system**
- Shows **just enough code to prove implementation**
- Doesn’t overwhelm or feel like a class essay

---

If you want next:
I can help you add:
- a **GIF demo at the top (huge upgrade)**
- or a **“Live Demo” section with your tunnel workflow cleaned up**

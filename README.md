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

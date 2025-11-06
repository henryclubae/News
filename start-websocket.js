// WebSocket Server Startup Script - Run: node start-websocket.js
import { createWebSocketServer } from './src/lib/websocket-server.js';

console.log('Starting WebSocket server on port 3001...');
createWebSocketServer(3001);
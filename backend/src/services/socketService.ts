import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { FeedPost } from '../types';
import { generateSimulatedPost } from './mockData';

class SocketService {
  private io: SocketIOServer | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;

  init(server: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        try {
          const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string };
          socket.data.userId = decoded.id;
        } catch (err) {
          console.warn('[Socket] Unauthenticated socket connected');
        }
      }
      next();
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] User ${userId} joined their room`);
      }

      socket.on('join_feed', () => {
        socket.join('public_feed');
      });

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    // Start background simulated post stream (every 25 seconds) to demonstrate real-time feed
    this.startSimulation();

    return this.io;
  }

  startSimulation(): void {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      if (!this.io) return;
      const newPost = generateSimulatedPost();
      this.io.emit('new_post', newPost);
      console.log(`[Socket] Emitted simulated post: [${newPost.platform.toUpperCase()}] ${newPost.content.substring(0, 40)}...`);
    }, 25000);
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitNewPost(post: FeedPost): void {
    if (this.io) {
      this.io.emit('new_post', post);
    }
  }
}

export const socketService = new SocketService();

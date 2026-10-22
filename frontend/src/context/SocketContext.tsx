import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { FeedPost } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  incomingPosts: FeedPost[];
  clearIncomingPosts: () => FeedPost[];
  dismissIncomingPosts: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [incomingPosts, setIncomingPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    // Only connect if token exists
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketInstance = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      socketInstance.emit('join_feed');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('new_post', (post: FeedPost) => {
      setIncomingPosts((prev) => [post, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const clearIncomingPosts = (): FeedPost[] => {
    const posts = [...incomingPosts];
    setIncomingPosts([]);
    return posts;
  };

  const dismissIncomingPosts = () => {
    setIncomingPosts([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        incomingPosts,
        clearIncomingPosts,
        dismissIncomingPosts,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && !socket) {
      // Establish connection when user logs in
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        transports: ['websocket'],
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('registerUser', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);
    } else if (!user && socket) {
      // Disconnect when user logs out
      socket.disconnect();
      setSocket(null);
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

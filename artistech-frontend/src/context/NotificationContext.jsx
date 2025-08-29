import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { AuthContext } from './AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (token) {
        try {
          const response = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    };
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (socket && user) {
      const handleNewNotification = (newNotification) => {
        setNotifications(prev => {
            // Prevent adding duplicate notifications
            if (prev.some(n => n.id === newNotification.id)) {
                return prev;
            }
            return [newNotification, ...prev];
        });
        setUnreadCount(prev => prev + 1);
        toast.info(newNotification.message, {
            action: {
                label: 'View',
                onClick: () => navigate(newNotification.link || '/'),
            },
        });
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket, user]);

  const markAsRead = async (notificationIds) => {
    try {
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationIds }),
        });
        
        setNotifications(prev => 
            prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: 1 } : n)
        );
        setUnreadCount(prev => prev - notificationIds.length);

    } catch (error) {
        console.error("Failed to mark notifications as read:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useStore';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [notifications, setNotifications] = useState([]);
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/bardobode.jpg',
        badge: '/bardobode.jpg',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    
    // Show browser notification
    showNotification(notification.title, {
      body: notification.message,
      tag: notification.type
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    permission,
    notifications,
    requestPermission,
    addNotification,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  };
};
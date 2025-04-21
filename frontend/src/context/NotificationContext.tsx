import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getBookings } from '../utils/localStorage';
// import toast from 'react-hot-toast';

interface Notification {//features of notificaton
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
  bookingId?: string;
}

interface NotificationContextType {//what this notification  context will provide to other components
  notifications: Notification[];
  markAsRead: (id: string) => void;
  addNotification: (userId: string, message: string, bookingId?: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedBookings] = useState(new Set<string>());//A Set to keep track of which booking notifications have already been handled (so it doesn’t show them again).
  const { user } = useAuth();


  //Load Notifications from LocalStorage (on user login)
  useEffect(() => {
    if (user) {
      const storedNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
      setNotifications(storedNotifications);
    }
  }, [user]);


//Check for New Bookings Every 30 Seconds
  useEffect(() => {
    if (user) {
      const checkNewBookings = () => {
        const bookings = getBookings();
        const relevantBookings = bookings.filter(booking => 
          (booking.teacherId === user.id || booking.learnerId === user.id) &&
          !processedBookings.has(booking.id)
        );

        relevantBookings.forEach(booking => {
          if (!processedBookings.has(booking.id)) {
            processedBookings.add(booking.id);
            
            // const isTeacher = booking.teacherId === user.id;
            // const message = isTeacher
            //   ? `New booking request for your session`
            //   : `Your booking request has been created`;
            
            // Only show toast for new bookings
            // toast(message, {
            //   icon: '📅',
            //   duration: 5000,
            // });
          }
        });
      };

      // Check less frequently to avoid spam
      const interval = setInterval(checkNewBookings, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, processedBookings]);


// Add New Notification
  const addNotification = (userId: string, message: string, bookingId?: string) => {
    // Check if a notification with the same bookingId already exists
    if (bookingId && notifications.some(n => n.bookingId === bookingId)) {
      return;
    }

    const newNotification: Notification = {
      id: crypto.randomUUID(),
      userId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      bookingId,
    };

    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }
  };

  // Clear All Notifications empty array
  // This function clears all notifications for the current user
  const clearAllNotifications = () => {
    if (user) {
      setNotifications([]);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
    }
  };


  // Count unread notifications

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      markAsRead, 
      addNotification, 
      clearAllNotifications,
      unreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
import React, { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

export const Notifications: React.FC = () => {
  const { notifications, markAsRead, clearAllNotifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Only show notifications on authenticated pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (!user || isAuthPage) return null;

  return (
    <div className="fixed top-20 right-8 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <Bell className="h-6 w-6 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-300"
                title="Clear all notifications"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No notifications yet</p>
                <p className="text-sm">We'll notify you when something happens</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`flex items-start ${!notification.read ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), 'PPp')}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
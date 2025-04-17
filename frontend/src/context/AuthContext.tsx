import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUser } from '../utils/localStorage';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Set loading to false after restoring user
  }, []);

  const login = (email: string, password: string) => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email);
    if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = (name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return false;
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      skills: []
    };
    saveUser(newUser);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
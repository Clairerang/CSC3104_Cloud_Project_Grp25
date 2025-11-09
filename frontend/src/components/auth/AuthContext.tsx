import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'caregiver' | 'senior';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call your backend API
    // For demo purposes, determine role based on email
    let role: 'admin' | 'caregiver' | 'senior';

    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('caregiver') || email.includes('care')) {
      role = 'caregiver';
    } else {
      role = 'senior';
    }

    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role,
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

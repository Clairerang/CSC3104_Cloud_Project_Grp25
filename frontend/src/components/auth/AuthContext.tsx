import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'caregiver' | 'senior' | 'family';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount (using sessionStorage for per-tab isolation)
    const storedUser = sessionStorage.getItem('user');
    console.log('AuthContext: Restoring user from sessionStorage:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('AuthContext: Parsed user data:', parsedUser);
      setUser(parsedUser);
    }
    setLoading(false);

  }, []);

  const login = async (email: string, password: string) => {
    try {
  // Clear any existing session data first (using sessionStorage for per-tab sessions)
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('adminToken');
      setUser(null);

      // Call the backend login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Extract user data and token from response
      const { token, user: userData } = data;

      // Keep backend role as-is (no mapping)
      let role: 'admin' | 'caregiver' | 'senior' | 'family';
      if (userData.role === 'admin') {
        role = 'admin';
      } else if (userData.role === 'family') {
        role = 'family';
      } else if (userData.role === 'caregiver') {
        role = 'caregiver';
      } else {
        role = 'senior';
      }

      const user: User = {
        id: userData.userId,
        name: userData.profile.name,
        email: userData.email,
        role,
      };

      console.log('AuthContext: Login successful, user data:', user);
      console.log('AuthContext: User role:', role);
      console.log('AuthContext: Stored token:', token.substring(0, 20) + '...');

    setUser(user);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token); // Store as 'token' for CheckInScreen
    sessionStorage.setItem('authToken', token); // Also store as 'authToken' for compatibility

      // Force a small delay to ensure localStorage is written before any API calls
      await new Promise(resolve => setTimeout(resolve, 100));

      return user; // Return user data so Login component can access the role
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
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

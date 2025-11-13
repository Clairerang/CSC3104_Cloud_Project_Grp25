import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'caregiver' | 'senior';
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
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    console.log('AuthContext: Restoring user from localStorage:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('AuthContext: Parsed user data:', parsedUser);
      setUser(parsedUser);
    }
    setLoading(false);

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      console.log('AuthContext: Storage changed in another tab', e.key);
      if (e.key === 'user') {
        if (e.newValue) {
          const newUser = JSON.parse(e.newValue);
          console.log('AuthContext: User changed in another tab, updating to:', newUser);
          setUser(newUser);
          // Redirect to appropriate dashboard based on new user role
          if (newUser.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (newUser.role === 'caregiver') {
            window.location.href = '/caregiver';
          } else if (newUser.role === 'senior') {
            window.location.href = '/senior';
          }
        } else {
          // User was removed (logged out in another tab)
          console.log('AuthContext: User logged out in another tab');
          setUser(null);
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
  // Clear any existing session data first
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminToken');
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

      // Map backend role to frontend role type
      let role: 'admin' | 'caregiver' | 'senior';
      if (userData.role === 'admin') {
        role = 'admin';
      } else if (userData.role === 'family') {
        role = 'caregiver'; // Map family to caregiver role in frontend
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
      console.log('AuthContext: Backend role:', userData.role, '-> Frontend role:', role);
      console.log('AuthContext: Stored token:', token.substring(0, 20) + '...');

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token); // Store as 'token' for CheckInScreen
    localStorage.setItem('authToken', token); // Also store as 'authToken' for compatibility

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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
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

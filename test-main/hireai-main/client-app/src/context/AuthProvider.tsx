// AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useDebugValue,
  useState,
  useEffect,
} from 'react';
import { Auth, AuthContextValues } from '../types';

const AuthContext = createContext<AuthContextValues | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<Auth | null>(() => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  useDebugValue(context.auth ? 'Logged In' : 'Logged Out');
  return context;
};

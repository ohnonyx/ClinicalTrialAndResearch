import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setTokens, clearTokens, getToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token on mount
    const token = getToken();
    if (token) {
      // Decode token to get user info (simplified - in production use proper JWT decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.user);
      } catch (error) {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.firstName}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      clearTokens();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      // Still clear tokens on error
      setUser(null);
      clearTokens();
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    try {
      await authAPI.register(data);
      toast({
        title: 'Registration successful',
        description: 'You can now log in with your credentials',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
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

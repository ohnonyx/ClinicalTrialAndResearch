import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
  setUser?: (user: User) => void; // for hardcoded login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Hardcoded login
  const login = async (email?: string, password?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const testUser: User = { email: email || 'test@demo.com' }; // default test user
        setUser(testUser);
        localStorage.setItem('user', JSON.stringify(testUser));
        resolve();
      }, 300); // simulate async delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Using UUID simply as a placeholder for generated IDs in the mock logic
const generateId = () => Math.random().toString(36).substring(2, 9);

export interface User {
  userId: string;
  phone: string;
  name?: string;
  location?: string;
  isVerified: boolean;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, location: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ray_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check local storage on initialization
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const login = async (phone: string, otp: string): Promise<boolean> => {
    // Mock OTP verification delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For MVP, accept any 6 digits.
    if (otp.length === 6) {
      const newUser: User = {
        userId: generateId(),
        phone,
        isVerified: true,
        joinedAt: new Date().toISOString(),
      };
      // In MVP, we might want to check if the user already exists in a simulated backend.
      // But because this is fully local, logging in just overwrites the active local profile 
      // unless we matched existing phone. Let's just set the new user or recover existing if needed in a broader app.
      
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (name: string, location: string) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, name, location };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

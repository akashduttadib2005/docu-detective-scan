
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  creditsRemaining: number;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateCredits: (newCredits: number) => void;
  reduceCredits: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Simulate login functionality
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - in a real app, you would validate against a backend
      if (email === 'admin@example.com' && password === 'password') {
        const adminUser: User = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          isAdmin: true,
          creditsRemaining: 9999
        };
        setCurrentUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast({
          title: "Login successful",
          description: "Welcome back, Admin!",
        });
      } else if (email === 'user@example.com' && password === 'password') {
        const regularUser: User = {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          isAdmin: false,
          creditsRemaining: 20
        };
        setCurrentUser(regularUser);
        localStorage.setItem('user', JSON.stringify(regularUser));
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Simulate registration functionality
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, you would send this data to your backend
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        name,
        isAdmin: false,
        creditsRemaining: 20
      };
      setCurrentUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateCredits = (newCredits: number) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, creditsRemaining: newCredits };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const reduceCredits = () => {
    if (currentUser && currentUser.creditsRemaining > 0) {
      const updatedUser = { ...currentUser, creditsRemaining: currentUser.creditsRemaining - 1 };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    updateCredits,
    reduceCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

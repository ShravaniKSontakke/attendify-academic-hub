
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// This would be replaced with actual Supabase auth when integrated
interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: "student" | "teacher") => Promise<void>;
  signup: (name: string, email: string, password: string, role: "student" | "teacher") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration (would be replaced by Supabase)
const mockUsers = [
  {
    id: "1",
    name: "John Teacher",
    email: "teacher@example.com",
    password: "password123",
    role: "teacher"
  },
  {
    id: "2",
    name: "Jane Student",
    email: "student@example.com",
    password: "password123",
    role: "student"
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("attendify-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: "student" | "teacher") => {
    try {
      setLoading(true);
      // Simulating API call
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password && u.role === role
      );

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem("attendify-user", JSON.stringify(userWithoutPassword));
        
        // Navigate based on role
        navigate(role === "teacher" ? "/teacher" : "/student");
        toast.success(`Welcome back, ${foundUser.name}!`);
      } else {
        toast.error("Invalid credentials or role");
      }
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: "student" | "teacher") => {
    try {
      setLoading(true);
      // Simulating API call
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role
      };

      setUser(newUser);
      localStorage.setItem("attendify-user", JSON.stringify(newUser));
      navigate(role === "teacher" ? "/teacher" : "/student");
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Signup failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("attendify-user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

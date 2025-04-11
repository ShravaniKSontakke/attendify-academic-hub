
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string, role: "student" | "teacher") => Promise<void>;
  signup: (name: string, email: string, password: string, role: "student" | "teacher") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For demo purposes - will be removed once Supabase auth is fully integrated
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state and set up listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: "student" | "teacher") => {
    try {
      setLoading(true);
      
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Fallback to mock users for demo purposes
        const foundUser = mockUsers.find(
          (u) => u.email === email && u.password === password && u.role === role
        );

        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          // @ts-ignore - this is just for demo
          setUser(userWithoutPassword as User);
          localStorage.setItem("attendify-user", JSON.stringify(userWithoutPassword));
          
          // Navigate based on role
          navigate(role === "teacher" ? "/teacher" : "/student");
          toast.success(`Welcome back, ${foundUser.name}!`);
        } else {
          toast.error("Invalid credentials or role");
        }
      } else {
        // Successful Supabase login
        // Navigate based on role from user metadata
        const userRole = data.user?.user_metadata?.role || 'student';
        navigate(userRole === "teacher" ? "/teacher" : "/student");
        toast.success(`Welcome back!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: "student" | "teacher") => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;

      toast.success("Account created successfully! Please check your email for verification.");
      
      // For demo purposes, auto-login without email verification
      // In production, you'd wait for the user to verify their email
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        navigate(role === "teacher" ? "/teacher" : "/student");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem("attendify-user");
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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

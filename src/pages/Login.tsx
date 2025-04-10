
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={user?.role === "teacher" ? "/teacher" : "/student"} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">AttendifyHub</h1>
        <p className="text-muted-foreground mt-2">Academic Attendance Management System</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;

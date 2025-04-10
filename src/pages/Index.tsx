import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated) {
    return <Navigate to={user?.role === "teacher" ? "/teacher" : "/student"} />;
  }
  
  // Otherwise redirect to login
  return <Navigate to="/login" />;
};

export default Index;


import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "@/components/student/StudentDashboard";

const Student: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Redirect to teacher dashboard if user is a teacher
  if (user?.role !== "student") {
    return <Navigate to="/teacher" />;
  }
  
  return <StudentDashboard />;
};

export default Student;

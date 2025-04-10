
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";

const Teacher: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Redirect to student dashboard if user is a student
  if (user?.role !== "teacher") {
    return <Navigate to="/student" />;
  }
  
  return <TeacherDashboard />;
};

export default Teacher;

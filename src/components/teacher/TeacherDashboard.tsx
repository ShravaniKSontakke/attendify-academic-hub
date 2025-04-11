
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import AttendanceOverview from "./AttendanceOverview";
import MarkAttendance from "./MarkAttendance";
import StudentMarks from "./StudentMarks";
import LeaveReports from "./LeaveReports";
import StudentReports from "./StudentReports";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user name from user metadata or default to "Teacher"
  const userName = (user?.user_metadata?.name || user?.email?.split('@')[0] || "Teacher") as string;

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}
          </p>
        </div>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="marks">Student Marks</TabsTrigger>
          <TabsTrigger value="leaves">Leave Reports</TabsTrigger>
          <TabsTrigger value="reports">Student Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <AttendanceOverview />
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <MarkAttendance />
        </TabsContent>
        
        <TabsContent value="marks" className="space-y-4">
          <StudentMarks />
        </TabsContent>
        
        <TabsContent value="leaves" className="space-y-4">
          <LeaveReports />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <StudentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;


import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStudentAttendance } from "@/services/mockData";

// For demo purposes - we're using a fixed student ID
// In a real app, this would come from the auth context
const STUDENT_ID = "s1";

const AttendanceSection: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  
  const attendance = getStudentAttendance(STUDENT_ID);
  
  // Filter by month if selected
  const filteredAttendance = selectedMonth !== "all"
    ? attendance.filter(a => a.date.startsWith(selectedMonth))
    : attendance;
  
  // Group by date for display
  const groupedAttendance = filteredAttendance.reduce((acc, curr) => {
    const date = curr.date;
    
    if (!acc[date]) {
      acc[date] = {
        date,
        morning: "N/A",
        afternoon: "N/A",
        evening: "N/A"
      };
    }
    
    acc[date][curr.session] = curr.status;
    
    return acc;
  }, {} as Record<string, { date: string; morning: string; afternoon: string; evening: string; }>);
  
  // Convert to array and sort by date
  const attendanceByDate = Object.values(groupedAttendance).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Prepare data for charts
  const sessions = ["morning", "afternoon", "evening"];
  
  const chartData = sessions.map(session => {
    const present = filteredAttendance.filter(a => a.session === session && a.status === "present").length;
    const absent = filteredAttendance.filter(a => a.session === session && a.status === "absent").length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    
    return {
      name: session.charAt(0).toUpperCase() + session.slice(1),
      present,
      absent,
      percentage: Math.round(percentage)
    };
  });
  
  // Calculate overall statistics
  const totalPresent = filteredAttendance.filter(a => a.status === "present").length;
  const totalAbsent = filteredAttendance.filter(a => a.status === "absent").length;
  const totalSessions = totalPresent + totalAbsent;
  const attendancePercentage = totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(1) : "0";
  
  // Prepare pie chart data
  const pieChartData = [
    { name: "Present", value: totalPresent, color: "#4ade80" },
    { name: "Absent", value: totalAbsent, color: "#f87171" }
  ];
  
  // Available months for filtering
  const months = [
    { value: "all", label: "All Time" },
    { value: "2023-01", label: "January 2023" },
    { value: "2023-02", label: "February 2023" },
    { value: "2023-03", label: "March 2023" },
    { value: "2023-04", label: "April 2023" },
    { value: "2023-05", label: "May 2023" }
  ];
  
  // Available subjects for filtering
  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "English", label: "English" },
    { value: "Social Studies", label: "Social Studies" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Your attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold">{attendancePercentage}%</div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
            </div>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Breakdown</CardTitle>
            <CardDescription>Attendance by session time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#4ade80" />
                <Bar dataKey="absent" name="Absent" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Detailed view of your attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="month">Filter by Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Filter by Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Morning</TableHead>
                <TableHead>Afternoon</TableHead>
                <TableHead>Evening</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceByDate.map(record => (
                <TableRow key={record.date}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>
                    <Badge variant={record.morning === "present" ? "default" : record.morning === "absent" ? "destructive" : "secondary"}>
                      {record.morning === "N/A" ? "N/A" : record.morning}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.afternoon === "present" ? "default" : record.afternoon === "absent" ? "destructive" : "secondary"}>
                      {record.afternoon === "N/A" ? "N/A" : record.afternoon}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.evening === "present" ? "default" : record.evening === "absent" ? "destructive" : "secondary"}>
                      {record.evening === "N/A" ? "N/A" : record.evening}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSection;

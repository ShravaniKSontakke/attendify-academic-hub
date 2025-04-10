
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { students, getStudentAttendance, getStudentMarks, getStudentLeaves } from "@/services/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const StudentReports: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  
  const attendance = selectedStudent ? getStudentAttendance(selectedStudent) : [];
  const marks = selectedStudent ? getStudentMarks(selectedStudent) : [];
  const leaves = selectedStudent ? getStudentLeaves(selectedStudent) : [];
  
  const student = students.find(s => s.id === selectedStudent);
  
  // Calculate attendance statistics
  const attendanceStats = {
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    total: attendance.length,
  };
  
  const attendancePercentage = attendanceStats.total > 0 
    ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1) 
    : "0";
  
  // Prepare attendance data for chart
  const attendanceChartData = attendance.reduce((acc, curr) => {
    const date = curr.date;
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      if (curr.status === "present") {
        existingDate.present++;
      } else {
        existingDate.absent++;
      }
    } else {
      acc.push({
        date,
        present: curr.status === "present" ? 1 : 0,
        absent: curr.status === "absent" ? 1 : 0
      });
    }
    
    return acc;
  }, [] as { date: string; present: number; absent: number }[]);
  
  // Sort by date
  attendanceChartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Prepare marks data for chart
  const marksChartData = marks.map(mark => ({
    subject: mark.subject,
    marks: mark.marks,
    term: mark.term
  }));
  
  // Prepare pie chart data for attendance
  const pieChartData = [
    { name: "Present", value: attendanceStats.present, color: "#4ade80" },
    { name: "Absent", value: attendanceStats.absent, color: "#f87171" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Reports</CardTitle>
        <CardDescription>View detailed reports for individual students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="student">Select Student</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger id="student" className="w-[300px]">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.batch} - {student.board})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedStudent ? (
          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="marks">Marks</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="summary">Overall Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendancePercentage}%</div>
                    <p className="text-xs text-muted-foreground">
                      Total: {attendanceStats.present} present / {attendanceStats.total} sessions
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Attendance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
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
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#4ade80" name="Present" />
                      <Line type="monotone" dataKey="absent" stroke="#f87171" name="Absent" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Marks</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marksChartData.map((mark, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{mark.subject}</TableCell>
                          <TableCell>{mark.term}</TableCell>
                          <TableCell>{mark.marks}</TableCell>
                          <TableCell>
                            {mark.marks >= 90 ? 'A+' : 
                             mark.marks >= 80 ? 'A' : 
                             mark.marks >= 70 ? 'B' : 
                             mark.marks >= 60 ? 'C' : 
                             mark.marks >= 50 ? 'D' : 'F'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leaves" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {leaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaves.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>{leave.date}</TableCell>
                            <TableCell>{leave.reason}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  leave.status === "approved" ? "default" : 
                                  leave.status === "rejected" ? "destructive" : 
                                  "secondary"
                                }
                              >
                                {leave.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No leave requests found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{student?.name}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Batch:</span>
                          <span className="font-medium">{student?.batch}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Board:</span>
                          <span className="font-medium">{student?.board}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mt-6 mb-2">Attendance Summary</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Present Days:</span>
                          <span className="font-medium">{attendanceStats.present}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Absent Days:</span>
                          <span className="font-medium">{attendanceStats.absent}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Attendance Rate:</span>
                          <span className="font-medium">{attendancePercentage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Academic Performance</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Average Marks:</span>
                          <span className="font-medium">
                            {marks.length > 0 
                              ? (marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length).toFixed(1)
                              : "N/A"
                            }
                          </span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Highest Mark:</span>
                          <span className="font-medium">
                            {marks.length > 0 
                              ? Math.max(...marks.map(mark => mark.marks))
                              : "N/A"
                            }
                          </span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Leaves Taken:</span>
                          <span className="font-medium">{leaves.length}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mt-6 mb-2">Overall Assessment</h3>
                      <p className="text-sm">
                        {attendancePercentage && Number(attendancePercentage) > 90 && marks.length > 0 && marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length > 80
                          ? "Excellent performance with high attendance and academic achievement."
                          : attendancePercentage && Number(attendancePercentage) > 80 && marks.length > 0 && marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length > 70
                          ? "Good performance with consistent attendance and academic results."
                          : attendancePercentage && Number(attendancePercentage) > 70
                          ? "Average performance. Attendance is reasonable but can improve."
                          : "Needs improvement in attendance and academic performance."
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Please select a student to view their report.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentReports;

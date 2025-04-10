
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStudentAttendance, getStudentMarks, getStudentLeaves } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowBigDown, ArrowBigUp, CalendarIcon, GraduationCap, User } from "lucide-react";

// For demo purposes - we're using a fixed student ID
// In a real app, this would come from the auth context
const STUDENT_ID = "s1";

const StudentReport: React.FC = () => {
  const attendance = getStudentAttendance(STUDENT_ID);
  const marks = getStudentMarks(STUDENT_ID);
  const leaves = getStudentLeaves(STUDENT_ID);
  
  // Calculate attendance statistics
  const totalPresent = attendance.filter(a => a.status === "present").length;
  const totalAbsent = attendance.filter(a => a.status === "absent").length;
  const totalSessions = totalPresent + totalAbsent;
  const attendancePercentage = totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(1) : "0";
  
  // Calculate marks statistics
  const averageMark = marks.length > 0 
    ? (marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length).toFixed(1)
    : "0";
  
  // Prepare data for trend chart
  const trendData = [] as any[];
  
  // Process marks data to show progression
  const subjects = [...new Set(marks.map(m => m.subject))];
  const terms = [...new Set(marks.map(m => m.term))];
  
  terms.forEach(term => {
    const termData: any = { name: term };
    
    subjects.forEach(subject => {
      const subjectMark = marks.find(m => m.subject === subject && m.term === term);
      if (subjectMark) {
        termData[subject] = subjectMark.marks;
      }
    });
    
    trendData.push(termData);
  });
  
  // Get performance indicators
  const midtermAverage = marks.filter(m => m.term === "Midterm").reduce((sum, m) => sum + m.marks, 0) / 
                         marks.filter(m => m.term === "Midterm").length;
                         
  const finalAverage = marks.filter(m => m.term === "Final").reduce((sum, m) => sum + m.marks, 0) / 
                       marks.filter(m => m.term === "Final").length;
                       
  const improvementPercentage = midtermAverage > 0 
    ? (((finalAverage - midtermAverage) / midtermAverage) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <Progress value={Number(attendancePercentage)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalPresent} present out of {totalSessions} sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Average</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMark}/100</div>
            <Progress value={Number(averageMark)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Overall average across all subjects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
            {Number(improvementPercentage) >= 0 ? (
              <ArrowBigUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowBigDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">
                {Math.abs(Number(improvementPercentage))}%
              </div>
              <div className={Number(improvementPercentage) >= 0 ? "text-green-500" : "text-red-500"}>
                {Number(improvementPercentage) >= 0 ? "improvement" : "decline"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From Midterm to Final exams
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Performance trend across terms</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {subjects.map((subject, index) => (
                <Line 
                  key={subject}
                  type="monotone" 
                  dataKey={subject} 
                  stroke={
                    index === 0 ? "#3b82f6" : 
                    index === 1 ? "#10b981" : 
                    index === 2 ? "#ef4444" : 
                    "#f59e0b"
                  } 
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your last 5 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.slice(0, 5).map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell className="capitalize">{record.session}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "present" ? "default" : "destructive"}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Status of your leave applications</CardDescription>
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
                  {leaves.map((leave, index) => (
                    <TableRow key={index}>
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
          <CardDescription>Your academic performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Number(attendancePercentage) > 90 && (
                  <li>Excellent attendance record with {attendancePercentage}% attendance rate</li>
                )}
                {Number(improvementPercentage) > 10 && (
                  <li>Strong improvement trend with {improvementPercentage}% increase from Midterm to Final exams</li>
                )}
                {marks.some(m => m.marks > 90) && (
                  <li>Exceptional performance in {marks.filter(m => m.marks > 90).length} subject areas with scores above 90%</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Number(attendancePercentage) < 80 && (
                  <li>Attendance rate of {attendancePercentage}% is below the recommended 80% threshold</li>
                )}
                {Number(improvementPercentage) < 0 && (
                  <li>Performance trend shows a decline of {Math.abs(Number(improvementPercentage))}% from Midterm to Final exams</li>
                )}
                {marks.some(m => m.marks < 60) && (
                  <li>Additional focus needed in {marks.filter(m => m.marks < 60).map(m => m.subject).join(", ")}</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Number(attendancePercentage) < 90 && (
                  <li>Improve attendance to enhance learning continuity</li>
                )}
                {marks.some(m => m.marks < 70) && (
                  <li>Consider additional support in challenging subjects</li>
                )}
                {Number(improvementPercentage) < 5 && (
                  <li>Develop a consistent study schedule to improve performance trends</li>
                )}
                <li>Maintain regular reviews of learning materials</li>
                <li>Engage actively in classroom discussions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentReport;

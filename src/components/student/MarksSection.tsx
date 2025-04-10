
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStudentMarks } from "@/services/mockData";
import { Progress } from "@/components/ui/progress";

// For demo purposes - we're using a fixed student ID
// In a real app, this would come from the auth context
const STUDENT_ID = "s1";

const MarksSection: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState("all");
  
  const marks = getStudentMarks(STUDENT_ID);
  
  // Filter by term if selected
  const filteredMarks = selectedTerm !== "all"
    ? marks.filter(m => m.term === selectedTerm)
    : marks;
  
  // Get all subjects
  const subjects = [...new Set(marks.map(m => m.subject))];
  
  // Calculate statistics
  const totalMarks = filteredMarks.reduce((sum, mark) => sum + mark.marks, 0);
  const averageMark = filteredMarks.length > 0 ? (totalMarks / filteredMarks.length).toFixed(1) : "0";
  const highestMark = filteredMarks.length > 0 ? Math.max(...filteredMarks.map(m => m.marks)) : 0;
  const lowestMark = filteredMarks.length > 0 ? Math.min(...filteredMarks.map(m => m.marks)) : 0;
  
  // Prepare bar chart data (by subject)
  const barChartData = subjects.map(subject => {
    const subjectMarks = filteredMarks.filter(m => m.subject === subject);
    const average = subjectMarks.length > 0 
      ? subjectMarks.reduce((sum, m) => sum + m.marks, 0) / subjectMarks.length
      : 0;
    
    return {
      name: subject,
      marks: Math.round(average)
    };
  });
  
  // Prepare radar chart data (by term and subject)
  const radarChartData = subjects.map(subject => {
    const result: { subject: string; [key: string]: any } = { subject };
    
    // Get marks for each term
    const terms = [...new Set(marks.map(m => m.term))];
    terms.forEach(term => {
      const termMark = marks.find(m => m.subject === subject && m.term === term);
      result[term] = termMark ? termMark.marks : 0;
    });
    
    return result;
  });
  
  // Available terms for filtering
  const terms = [
    { value: "all", label: "All Terms" },
    { value: "Midterm", label: "Midterm" },
    { value: "Final", label: "Final" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMark}/100</div>
            <Progress value={Number(averageMark)} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestMark}/100</div>
            <Progress value={highestMark} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowestMark}/100</div>
            <Progress value={lowestMark} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageMark && Number(averageMark) >= 90 ? 'A+' : 
               averageMark && Number(averageMark) >= 80 ? 'A' : 
               averageMark && Number(averageMark) >= 70 ? 'B' : 
               averageMark && Number(averageMark) >= 60 ? 'C' : 
               averageMark && Number(averageMark) >= 50 ? 'D' : 'F'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on your average score across all subjects
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Your marks by subject</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="marks" fill="#3b82f6" name="Average Marks" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Marks Detail</CardTitle>
              <CardDescription>Detailed view of your marks</CardDescription>
            </div>
            <div className="w-[200px]">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMarks.map((mark, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{mark.subject}</TableCell>
                  <TableCell>{mark.term}</TableCell>
                  <TableCell>{mark.marks}/100</TableCell>
                  <TableCell>
                    {mark.marks >= 90 ? 'A+' : 
                     mark.marks >= 80 ? 'A' : 
                     mark.marks >= 70 ? 'B' : 
                     mark.marks >= 60 ? 'C' : 
                     mark.marks >= 50 ? 'D' : 'F'}
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <Progress value={mark.marks} className="w-full" />
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

export default MarksSection;

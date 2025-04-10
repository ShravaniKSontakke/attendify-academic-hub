
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStudentsByBatchAndBoard, getStudentMarks } from "@/services/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

const StudentMarks: React.FC = () => {
  const [batch, setBatch] = useState("");
  const [board, setBoard] = useState("");
  const [term, setTerm] = useState("Midterm");
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const batches = ["9th", "10th", "11th", "12th"];
  const boards = ["CBSE", "ICSE", "State Board"];
  const terms = ["Midterm", "Final"];

  useEffect(() => {
    if (batch && board) {
      const filteredStudents = getStudentsByBatchAndBoard(batch, board);
      setStudents(filteredStudents);
      
      // Initialize marks data
      const initialMarks: Record<string, Record<string, number>> = {};
      
      filteredStudents.forEach(student => {
        initialMarks[student.id] = {};
        
        // Get existing marks if available
        const studentMarks = getStudentMarks(student.id).filter(mark => mark.term === term);
        
        student.subjects.forEach(subject => {
          const existingMark = studentMarks.find(mark => mark.subject === subject);
          initialMarks[student.id][subject] = existingMark ? existingMark.marks : 0;
        });
      });
      
      setMarksData(initialMarks);
    }
  }, [batch, board, term]);

  const handleMarksChange = (studentId: string, subject: string, value: string) => {
    // Ensure value is a number between 0 and 100
    const numValue = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue
      }
    }));
  };

  const handleSaveMarks = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Marks saved successfully", {
        description: `Saved ${term} marks for ${students.length} students.`
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Marks</CardTitle>
        <CardDescription>Enter marks for students by batch, board and term</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="batch">Batch</Label>
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger id="batch">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="board">Board</Label>
            <Select value={board} onValueChange={setBoard}>
              <SelectTrigger id="board">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="term">Term</Label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger id="term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {students.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  {students[0].subjects.map((subject: string) => (
                    <TableHead key={subject}>{subject}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {student.subjects.map((subject: string) => (
                      <TableCell key={`${student.id}-${subject}`}>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={marksData[student.id]?.[subject] || ""}
                          onChange={(e) => handleMarksChange(student.id, subject, e.target.value)}
                          className="w-16 text-center"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveMarks} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Marks
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          batch && board ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No students found for the selected batch and board.</p>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Please select a batch and board to view students.</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMarks;

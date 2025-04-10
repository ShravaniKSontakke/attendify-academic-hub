
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStudentsByBatchAndBoard } from "@/services/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Save, Upload } from "lucide-react";

const MarkAttendance: React.FC = () => {
  const [batch, setBatch] = useState("");
  const [board, setBoard] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { morning: string; afternoon: string; evening: string; }>>({});
  const [isLoading, setIsLoading] = useState(false);

  const batches = ["9th", "10th", "11th", "12th"];
  const boards = ["CBSE", "ICSE", "State Board"];
  const sessions = ["morning", "afternoon", "evening"];

  useEffect(() => {
    if (batch && board) {
      const filteredStudents = getStudentsByBatchAndBoard(batch, board);
      setStudents(filteredStudents);
      
      // Initialize attendance data for all students
      const initialAttendance: Record<string, { morning: string; afternoon: string; evening: string; }> = {};
      filteredStudents.forEach(student => {
        initialAttendance[student.id] = {
          morning: "present",
          afternoon: "present",
          evening: "present"
        };
      });
      setAttendanceData(initialAttendance);
    }
  }, [batch, board]);

  const handleAttendanceChange = (studentId: string, session: string, value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [session]: value
      }
    }));
  };

  const handleSaveAttendance = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Attendance saved successfully", {
        description: `Saved attendance for ${students.length} students.`
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleImportCSV = () => {
    toast.info("CSV Import", {
      description: "This feature will be available after Supabase integration."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Select batch and board to mark student attendance</CardDescription>
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
          
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={handleImportCSV} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </div>

        {students.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Morning</TableHead>
                  <TableHead>Afternoon</TableHead>
                  <TableHead>Evening</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {sessions.map(session => (
                      <TableCell key={`${student.id}-${session}`}>
                        <RadioGroup
                          value={attendanceData[student.id]?.[session as keyof typeof attendanceData[string]] || "present"}
                          onValueChange={(value) => handleAttendanceChange(student.id, session, value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id={`${student.id}-${session}-present`} value="present" />
                            <Label htmlFor={`${student.id}-${session}-present`} className="text-green-600">Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id={`${student.id}-${session}-absent`} value="absent" />
                            <Label htmlFor={`${student.id}-${session}-absent`} className="text-red-600">Absent</Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveAttendance} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Attendance
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

export default MarkAttendance;

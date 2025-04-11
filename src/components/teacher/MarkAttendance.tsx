
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const MarkAttendance: React.FC = () => {
  const [batch, setBatch] = useState("");
  const [board, setBoard] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { morning: string; afternoon: string; evening: string; }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

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

  const handleSaveAttendance = async () => {
    setIsLoading(true);
    
    try {
      // Convert attendance data to format suitable for Supabase
      const date = new Date().toISOString().split('T')[0];
      const attendanceRecords = Object.entries(attendanceData).flatMap(([studentId, sessions]) => {
        return Object.entries(sessions).map(([session, status]) => ({
          student_id: studentId,
          date,
          status,
          class_id: null // You would set this based on your data model
        }));
      });

      // Save to Supabase
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (error) throw error;

      toast.success("Attendance saved successfully", {
        description: `Saved attendance for ${students.length} students.`
      });
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      // Example of how you might process this with Supabase storage
      const fileName = `attendance_imports/${Date.now()}_${csvFile.name}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('attendance-csvs')
        .upload(fileName, csvFile);

      if (error) throw error;

      // In a real implementation, you would then process this file
      // Either with a Supabase function or by reading it client-side

      toast.success("CSV imported successfully", {
        description: "Your attendance data is being processed."
      });
      
      setCsvFile(null);
      setImportDialogOpen(false);
    } catch (error: any) {
      console.error("Error importing CSV:", error);
      toast.error("Failed to import CSV", {
        description: error.message || "Please check your file and try again."
      });
    } finally {
      setIsLoading(false);
    }
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
            <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Import Attendance Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Upload a CSV file with attendance records. The file should have columns for student ID, date, and attendance status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Label htmlFor="csv-file" className="mb-2 block">Select CSV File</Label>
                  <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleImportCSV} disabled={isLoading || !csvFile}>
                    {isLoading ? "Importing..." : "Import"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

// Add the Input component that was missing
const Input = ({ id, type, accept, onChange, value, required, placeholder, className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      id={id}
      type={type}
      accept={accept}
      onChange={onChange}
      value={value}
      required={required}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default MarkAttendance;

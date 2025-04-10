
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateLeaves, students } from "@/services/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const LeaveReports: React.FC = () => {
  const [leaves, setLeaves] = useState(generateLeaves());
  const [filter, setFilter] = useState("all");

  const filteredLeaves = filter === "all" 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : "Unknown";
  };

  const getBatchAndBoard = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.batch} - ${student.board}` : "";
  };

  const handleStatusChange = (leaveId: string, newStatus: "approved" | "rejected") => {
    const updatedLeaves = leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: newStatus } : leave
    );
    
    setLeaves(updatedLeaves);
    
    toast.success(`Leave request ${newStatus}`, {
      description: `You have ${newStatus} a leave request.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Reports</CardTitle>
        <CardDescription>Manage student leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              onClick={() => setFilter("all")}
            >
              All Requests
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"} 
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={filter === "approved" ? "default" : "outline"} 
              onClick={() => setFilter("approved")}
            >
              Approved
            </Button>
            <Button 
              variant={filter === "rejected" ? "default" : "outline"} 
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </Button>
          </div>
        </div>

        {filteredLeaves.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.map(leave => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{getStudentName(leave.student_id)}</TableCell>
                  <TableCell>{getBatchAndBoard(leave.student_id)}</TableCell>
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
                  <TableCell>
                    {leave.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleStatusChange(leave.id, "approved")}
                          className="h-8 w-8 text-green-600"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleStatusChange(leave.id, "rejected")}
                          className="h-8 w-8 text-red-600"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No leave requests found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveReports;

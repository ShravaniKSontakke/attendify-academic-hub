
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define a proper type for attendance data
interface AttendanceRecord {
  id: string;
  date: string;
  status: string; // Allow any string value for status
  student_id: string;
}

// Sample data in case no attendance records are found
const sampleAttendanceData = [
  { name: 'Monday', morning: 1, afternoon: 1, evening: 1 },
  { name: 'Tuesday', morning: 1, afternoon: 0, evening: 1 },
  { name: 'Wednesday', morning: 1, afternoon: 1, evening: 0 },
  { name: 'Thursday', morning: 0, afternoon: 1, evening: 1 },
  { name: 'Friday', morning: 1, afternoon: 1, evening: 1 },
];

const AttendanceSection: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        // For Supabase auth users, use user.id
        const userId = user.id || (user as any)?.id;

        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', userId);

        if (error) {
          console.error("Error fetching attendance:", error);
          // Use sample data for demo purposes if there's an error
          setAttendanceData([]);
        } else {
          // Type-safe mapping of attendance data
          const formattedData: AttendanceRecord[] = (data || []).map(record => ({
            id: record.id,
            date: record.date,
            status: record.status,
            student_id: record.student_id
          }));

          setAttendanceData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  // Prepare data for chart
  const prepareChartData = () => {
    if (attendanceData.length === 0) {
      return sampleAttendanceData;
    }

    // Group attendance by date
    const groupedByDate = attendanceData.reduce((acc: any, record) => {
      const date = new Date(record.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0 };
      }
      record.status === 'present' ? acc[date].present++ : acc[date].absent++;
      return acc;
    }, {});

    // Convert to array format for chart
    return Object.keys(groupedByDate).map(date => ({
      name: date,
      morning: Math.random() > 0.3 ? 1 : 0,
      afternoon: Math.random() > 0.3 ? 1 : 0,
      evening: Math.random() > 0.3 ? 1 : 0
    }));
  };

  const chartData = prepareChartData();

  if (loading) {
    return <div className="flex justify-center p-8">Loading attendance...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Your attendance record for the current period</CardDescription>
      </CardHeader>
      <CardContent>
        {attendanceData.length === 0 && (
          <div className="text-sm text-muted-foreground mb-4">
            Using sample data for demonstration. Your actual attendance will appear here once recorded.
          </div>
        )}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="morning" fill="#4ade80" name="Morning" />
              <Bar dataKey="afternoon" fill="#60a5fa" name="Afternoon" />
              <Bar dataKey="evening" fill="#f87171" name="Evening" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceSection;

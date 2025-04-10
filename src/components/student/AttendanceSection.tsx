
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define a proper type for attendance data
interface AttendanceRecord {
  id: string;
  date: string;
  morning: 'present' | 'absent';
  afternoon: 'present' | 'absent';
  evening: 'present' | 'absent';
}

const AttendanceSection: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', user.id);

        if (error) throw error;

        // Type-safe mapping of attendance data
        const formattedData: AttendanceRecord[] = (data || []).map(record => ({
          id: record.id,
          date: record.date,
          morning: record.status === 'present' ? 'present' : 'absent',
          afternoon: record.status === 'present' ? 'present' : 'absent',
          evening: record.status === 'present' ? 'present' : 'absent'
        }));

        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  // Prepare data for weekly attendance chart
  const weeklyAttendanceData = attendanceData.map(record => ({
    name: new Date(record.date).toLocaleDateString(),
    morning: record.morning === 'present' ? 1 : 0,
    afternoon: record.afternoon === 'present' ? 1 : 0,
    evening: record.evening === 'present' ? 1 : 0
  }));

  if (loading) {
    return <div>Loading attendance...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Your attendance record for the current period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyAttendanceData}
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

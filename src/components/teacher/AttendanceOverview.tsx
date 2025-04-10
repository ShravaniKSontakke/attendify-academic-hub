
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getBatchAttendanceStats, getWeeklyAttendanceData } from "@/services/mockData";

const AttendanceOverview: React.FC = () => {
  const batchStats = getBatchAttendanceStats();
  const weeklyData = getWeeklyAttendanceData();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
          <CardDescription>
            Attendance status for all students in the current week
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
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
              <Bar dataKey="present" fill="#4ade80" name="Present" />
              <Bar dataKey="absent" fill="#f87171" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {batchStats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.name} Attendance
            </CardTitle>
            <div className="text-md font-bold">{stat.percentage}%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.present} / {stat.total}</div>
            <p className="text-xs text-muted-foreground">
              {stat.absent} students absent
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceOverview;

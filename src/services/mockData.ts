
// Mock data for students
export const students = [
  { id: "s1", name: "Alice Johnson", batch: "9th", board: "CBSE", subjects: ["Mathematics", "Science", "English", "Social Studies"] },
  { id: "s2", name: "Bob Smith", batch: "9th", board: "CBSE", subjects: ["Mathematics", "Science", "English", "Social Studies"] },
  { id: "s3", name: "Charlie Brown", batch: "10th", board: "CBSE", subjects: ["Mathematics", "Science", "English", "Social Studies"] },
  { id: "s4", name: "David Miller", batch: "10th", board: "ICSE", subjects: ["Mathematics", "Science", "English", "Social Studies"] },
  { id: "s5", name: "Emma Davis", batch: "11th", board: "CBSE", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "s6", name: "Frank Wilson", batch: "11th", board: "State Board", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "s7", name: "Grace Taylor", batch: "12th", board: "CBSE", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "s8", name: "Henry Martin", batch: "12th", board: "ICSE", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
];

// Mock data for attendance
export const generateAttendance = () => {
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const attendance = [];
  
  for (const student of students) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(oneWeekAgo.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const sessions = ["morning", "afternoon", "evening"];
      for (const session of sessions) {
        // Generate random attendance (80% chance of being present)
        const status = Math.random() > 0.2 ? "present" : "absent";
        
        attendance.push({
          id: `${student.id}-${date.toISOString()}-${session}`,
          student_id: student.id,
          date: date.toISOString().split('T')[0],
          session,
          status
        });
      }
    }
  }
  
  return attendance;
};

// Mock data for marks
export const generateMarks = () => {
  const marks = [];
  
  for (const student of students) {
    for (const subject of student.subjects) {
      const terms = ["Midterm", "Final"];
      for (const term of terms) {
        // Generate random marks (between 60 and 100)
        const score = Math.floor(Math.random() * 40) + 60;
        
        marks.push({
          id: `${student.id}-${subject}-${term}`,
          student_id: student.id,
          subject,
          marks: score,
          term
        });
      }
    }
  }
  
  return marks;
};

// Mock data for leave requests
export const generateLeaves = () => {
  const leaves = [];
  const reasons = [
    "Medical leave",
    "Family function",
    "Not feeling well",
    "Doctor's appointment",
    "Personal reasons"
  ];
  
  const statuses = ["pending", "approved", "rejected"];
  
  for (const student of students) {
    // Generate 1-3 leave requests per student
    const leaveCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < leaveCount; i++) {
      const today = new Date();
      // Random date in the last 30 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      leaves.push({
        id: `${student.id}-leave-${i}`,
        student_id: student.id,
        date: date.toISOString().split('T')[0],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
  }
  
  return leaves;
};

// Prepare all mock data
export const mockData = {
  students,
  attendance: generateAttendance(),
  marks: generateMarks(),
  leaves: generateLeaves()
};

// Utility functions to get filtered data
export const getStudentsByBatchAndBoard = (batch: string, board: string) => {
  return students.filter(
    (student) => student.batch === batch && student.board === board
  );
};

export const getStudentAttendance = (studentId: string) => {
  return mockData.attendance.filter(
    (record) => record.student_id === studentId
  );
};

export const getStudentMarks = (studentId: string) => {
  return mockData.marks.filter(
    (record) => record.student_id === studentId
  );
};

export const getStudentLeaves = (studentId: string) => {
  return mockData.leaves.filter(
    (record) => record.student_id === studentId
  );
};

// Functions for analytics
export const getAttendanceStats = () => {
  const stats = {
    present: 0,
    absent: 0,
    total: 0,
    presentPercentage: 0
  };
  
  mockData.attendance.forEach(record => {
    stats.total++;
    if (record.status === "present") {
      stats.present++;
    } else {
      stats.absent++;
    }
  });
  
  stats.presentPercentage = (stats.present / stats.total) * 100;
  
  return stats;
};

export const getBatchAttendanceStats = () => {
  const batches = ["9th", "10th", "11th", "12th"];
  const stats = batches.map(batch => {
    const batchStudents = students.filter(s => s.batch === batch).map(s => s.id);
    const batchAttendance = mockData.attendance.filter(a => batchStudents.includes(a.student_id));
    
    const present = batchAttendance.filter(a => a.status === "present").length;
    const total = batchAttendance.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    
    return {
      name: batch,
      present,
      absent: total - present,
      total,
      percentage: Math.round(percentage)
    };
  });
  
  return stats;
};

export const getWeeklyAttendanceData = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const data = days.map(day => {
    return {
      name: day,
      present: Math.floor(Math.random() * 30) + 70, // Random percentage between 70-100%
      absent: Math.floor(Math.random() * 30)
    };
  });
  
  return data;
};

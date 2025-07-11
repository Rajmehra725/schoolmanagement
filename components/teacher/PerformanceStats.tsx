'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PerformanceData {
  date: string;
  classesHeld: number;
  studentsPresent: number;
  assignmentsCompleted: number;
}

export default function PerformanceStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PerformanceData[]>([]);
  const [summary, setSummary] = useState({
    totalClasses: 0,
    avgAttendance: 0,
    assignmentCompletion: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Get last 7 days of performance data
        const today = new Date();
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        // Get attendance data
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('teacherId', '==', user.uid),
          where('date', 'in', last7Days)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        
        // Get assignment data
        const assignmentQuery = query(
          collection(db, 'assignments'),
          where('teacherId', '==', user.uid),
          where('date', 'in', last7Days)
        );
        const assignmentSnap = await getDocs(assignmentQuery);

        // Process and combine data
        const performanceData: PerformanceData[] = last7Days.map(date => {
          const dayAttendance = attendanceSnap.docs
            .filter(doc => doc.data().date === date);
          
          const dayAssignments = assignmentSnap.docs
            .filter(doc => doc.data().date === date);

          return {
            date: date.split('-').slice(1).join('/'), // Format as MM/DD
            classesHeld: dayAttendance.length,
            studentsPresent: dayAttendance.reduce((sum, doc) => 
              sum + doc.data().presentStudents.length, 0),
            assignmentsCompleted: dayAssignments.reduce((sum, doc) => 
              sum + doc.data().completedCount, 0)
          };
        });

        setStats(performanceData);

        // Calculate summary
        const totalClasses = performanceData.reduce((sum, day) => sum + day.classesHeld, 0);
        const totalPresent = performanceData.reduce((sum, day) => sum + day.studentsPresent, 0);
        const totalAssignments = performanceData.reduce((sum, day) => sum + day.assignmentsCompleted, 0);

        setSummary({
          totalClasses,
          avgAttendance: totalClasses ? Math.round((totalPresent / (totalClasses * 40)) * 100) : 0, // Assuming 40 students per class
          assignmentCompletion: totalClasses ? Math.round((totalAssignments / (totalClasses * 40)) * 100) : 0
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching performance stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Classes</h3>
          <p className="text-2xl font-bold text-blue-600">{summary.totalClasses}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Avg. Attendance</h3>
          <p className="text-2xl font-bold text-green-600">{summary.avgAttendance}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Assignment Completion</h3>
          <p className="text-2xl font-bold text-purple-600">{summary.assignmentCompletion}%</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-4 rounded-lg shadow h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="studentsPresent" 
              stroke="#2563eb" 
              name="Students Present"
            />
            <Line 
              type="monotone" 
              dataKey="assignmentsCompleted" 
              stroke="#7c3aed" 
              name="Assignments Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

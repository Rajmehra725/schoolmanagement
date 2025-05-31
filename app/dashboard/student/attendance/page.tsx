'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'attendance'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-6 min-h-screen bg-gray-50"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">📅 Attendance Record</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        </div>
      ) : sortedRecords.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl bg-white">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="border px-6 py-3 text-left cursor-pointer select-none flex items-center gap-1"
                >
                  Date <ArrowUpDown className="w-4 h-4" />
                </th>
                <th className="border px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map(rec => (
                <motion.tr
                  key={rec.id}
                  className="hover:bg-blue-50 transition-all even:bg-blue-50"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <td className="border px-6 py-4 font-medium text-gray-700">
                    {format(new Date(rec.date), 'dd MMM yyyy')}
                  </td>
                  <td
                    className={`border px-6 py-4 font-semibold flex items-center gap-2 ${
                      rec.status === 'Present' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {rec.status === 'Present' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    {rec.status}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

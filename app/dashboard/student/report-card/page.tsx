'use client'

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function ReportCardPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportCard = async () => {
      const snapshot = await getDocs(collection(db, 'reportCards'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    };
    fetchReportCard();
  }, []);

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report Card</h1>
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="bg-white shadow-md rounded-xl p-4">
            <h2 className="font-semibold text-lg">{report.subject}</h2>
            <p className="text-gray-600">Marks: {report.marks}</p>
            <p className="text-gray-500">Grade: {report.grade}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

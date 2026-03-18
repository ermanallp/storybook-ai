'use client';

import { useState, useEffect } from 'react';
import { app } from '@/app/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated && app) {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const db = getFirestore(app!);
          const statsDoc = await getDoc(doc(db, 'stats', 'clicks'));
          if (statsDoc.exists()) {
            setStats(statsDoc.data());
          }
        } catch (error) {
          console.error("Failed to fetch stats", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'kidoredo-admin-349') {
              setAuthenticated(true);
            } else {
              alert('Incorrect password');
            }
          }} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400"
            />
            <button type="submit" className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg text-sm">PRO</span>
            Tracking Dashboard
          </h1>
          <button 
            onClick={() => setAuthenticated(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Total Clicks Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col justify-between"
            >
              <h2 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-2">Total Clicks</h2>
              <div className="text-5xl font-extrabold text-white">
                {stats?.totalClicks || 0}
              </div>
            </motion.div>

            {/* Language Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl col-span-1 md:col-span-2"
            >
              <h2 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-4">By Language</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="py-2 px-4 font-normal">Language</th>
                      <th className="py-2 px-4 font-normal text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.byLocale ? Object.entries(stats.byLocale).sort((a: any, b: any) => b[1] - a[1]).map(([key, val]: any) => (
                      <tr key={key} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{key.toUpperCase()}</td>
                        <td className="py-3 px-4 text-right font-bold text-yellow-400">{val}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="py-4 text-center text-gray-500">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Country Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl col-span-1 md:col-span-1 lg:col-span-2"
            >
              <h2 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-4">By Country</h2>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-800 z-10">
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="py-2 px-4 font-normal">Country</th>
                      <th className="py-2 px-4 font-normal text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.byCountry ? Object.entries(stats.byCountry).sort((a: any, b: any) => b[1] - a[1]).map(([key, val]: any) => (
                      <tr key={key} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 text-gray-300">{key.replace(/_/g, '.')}</td>
                        <td className="py-3 px-4 text-right font-bold">{val}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="py-4 text-center text-gray-500">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* City Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl col-span-1"
            >
              <h2 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-4">By City (Top regions)</h2>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-800 z-10">
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="py-2 px-4 font-normal">City</th>
                      <th className="py-2 px-4 font-normal text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.byCity ? Object.entries(stats.byCity).sort((a: any, b: any) => b[1] - a[1]).slice(0, 50).map(([key, val]: any) => (
                      <tr key={key} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 text-gray-300 truncate max-w-[120px]" title={key}>{key.replace(/_/g, '.')}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-400">{val}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="py-4 text-center text-gray-500">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}

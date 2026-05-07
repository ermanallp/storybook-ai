'use client';

import { useEffect, useState } from 'react';
import { app } from '@/app/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function AdminPage() {
    const [clickStats, setClickStats] = useState<any>(null);
    const [completionStats, setCompletionStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!app) return;
            const db = getFirestore(app);
            
            try {
                const clicksRef = doc(db, 'stats', 'clicks');
                const clicksSnap = await getDoc(clicksRef);
                if (clicksSnap.exists()) {
                    setClickStats(clicksSnap.data());
                }

                const compRef = doc(db, 'stats', 'completions');
                const compSnap = await getDoc(compRef);
                if (compSnap.exists()) {
                    setCompletionStats(compSnap.data());
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Yükleniyor...</div>;
    }

    const totalClicks = clickStats?.totalCount || clickStats?.totalClicks || 0;
    const totalCompletions = completionStats?.totalCount || 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-purple-400">Kidoredo İstatistik Paneli</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* CLICKS SECTION */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">Hikaye Yarat Tıklamaları</h2>
                    <div className="text-5xl font-bold mb-6 text-center">{totalClicks}</div>
                    
                    <div>
                        <div>
                            <h3 className="text-lg text-gray-400 mb-2 border-b border-gray-700 pb-1">Dillere Göre</h3>
                            <ul className="space-y-1">
                                {Object.entries(clickStats?.byLocale || {}).map(([key, value]) => (
                                    <li key={key} className="flex justify-between"><span>{key}:</span> <span className="font-bold">{String(value)}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* COMPLETIONS SECTION */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-green-400">Tamamlanan Hikayeler</h2>
                    <div className="text-5xl font-bold mb-6 text-center">{totalCompletions}</div>
                    
                    <div>
                        <div>
                            <h3 className="text-lg text-gray-400 mb-2 border-b border-gray-700 pb-1">Dillere Göre</h3>
                            <ul className="space-y-1">
                                {Object.entries(completionStats?.byLocale || {}).map(([key, value]) => (
                                    <li key={key} className="flex justify-between"><span>{key}:</span> <span className="font-bold">{String(value)}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [theme, setTheme] = useState('macera');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Store data in localStorage or context to pass to the story generation page
    // For now, we'll pass it via query params or just navigate to a loading state
    const queryParams = new URLSearchParams({
      name,
      age,
      interests,
      theme,
    }).toString();

    router.push(`/story/generate?${queryParams}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-4 flex flex-col items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-400 p-4 rounded-full shadow-lg">
            <BookOpen size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 drop-shadow-md">
          Sihirli Hikayeler
        </h1>
        <p className="text-center text-blue-100 mb-8">
          Çocuğunuz için yapay zeka ile özel masallar yaratın!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 ml-1">Kahramanın Adı</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-white/50 text-white"
              placeholder="Örn: Ali"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 ml-1">Yaşı</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-white/50 text-white"
              placeholder="Örn: 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 ml-1">İlgi Alanları</label>
            <input
              type="text"
              required
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-white/50 text-white"
              placeholder="Örn: Dinozorlar, Uzay, Futbol"
            />
          </div>

           <div>
            <label className="block text-sm font-medium mb-1 ml-1">Hikaye Ortamı</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white [&>option]:text-black"
            >
              <option value="macera">Macera Dolu Orman</option>
              <option value="uzay">Sonsuz Uzay</option>
              <option value="deniz">Derin Denizler</option>
              <option value="okul">Sihirli Okul</option>
              <option value="sehir">Renkli Şehir</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-6 transition-colors"
          >
            {loading ? (
              'Sihir Hazırlanıyor...'
            ) : (
              <>
                <Sparkles size={20} />
                Hikayeyi Yarat
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
      
      <div className="mt-8 text-white/60 text-sm text-center">
        <p>Yapay zeka ile güçlendirilmiştir ✨</p>
      </div>
    </main>
  );
}

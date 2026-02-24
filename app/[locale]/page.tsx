'use client';

import { useState } from 'react';
import { useRouter } from '../../navigation';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const t = useTranslations('HomePage');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [theme, setTheme] = useState('macera');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      // User is not logged in, save data to localStorage and redirect to login
      localStorage.setItem('pendingStory', JSON.stringify({
        name,
        age,
        interests,
        theme: t(`themes.${theme}`)
      }));
      router.push('/login');
      return;
    }

    // Store data in localStorage or context to pass to the story generation page
    // For now, we'll pass it via query params or just navigate to a loading state
    const queryParams = new URLSearchParams({
      name,
      age,
      interests,
      theme: t(`themes.${theme}`),
    }).toString();

    router.push(`story/generate?${queryParams}`);
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-4 pb-4 pt-24 sm:p-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/landing-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/30" /> {/* Overlay for checkability */}
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2 sm:gap-4 items-center">
        <LanguageSwitcher />
        {!user ? (
          <>
            <Link href="/login" className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm font-semibold transition-all border border-white/30 shadow-lg">
              {t('login')}
            </Link>
            <Link href="/signup" className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-lg font-bold transition-all shadow-lg">
              {t('signup')}
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm font-semibold transition-all shadow-lg border border-white/20"
          >
            {t('logout')}
          </button>
        )}
      </div>

      {/* Brand Header */}
      <div className="z-10 mb-8 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-[var(--font-geist-sans)]">
          Kidoredo
        </h1>
        <div className="h-1 w-24 bg-yellow-400 rounded-full mt-2 shadow-lg" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 z-10"
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-white drop-shadow-md">
          {t('title')}
        </h2>
        <p className="text-center text-blue-50 mb-6 font-medium leading-relaxed">
          {t('description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-1 ml-1 shadow-black drop-shadow-sm">{t('heroNameLabel')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
              placeholder={t('heroNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('ageLabel')}</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
              placeholder={t('agePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('interestsLabel')}</label>
            <input
              type="text"
              required
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
              placeholder={t('interestsPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('themeLabel')}</label>
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white appearance-none cursor-pointer transition-all font-medium [&>option]:text-black"
              >
                <option value="macera">{t('themes.macera')}</option>
                <option value="uzay">{t('themes.uzay')}</option>
                <option value="deniz">{t('themes.deniz')}</option>
                <option value="okul">{t('themes.okul')}</option>
                <option value="sehir">{t('themes.sehir')}</option>
                <option value="sato">{t('themes.sato')}</option>
                <option value="superkahraman">{t('themes.superkahraman')}</option>
                <option value="ada">{t('themes.ada')}</option>
                <option value="ciftlik">{t('themes.ciftlik')}</option>
                <option value="lunapark">{t('themes.lunapark')}</option>
                <option value="kar">{t('themes.kar')}</option>
                <option value="oyuncak">{t('themes.oyuncak')}</option>
                <option value="seker">{t('themes.seker')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:mt-1 flex items-center justify-center gap-2 mt-8 transition-all"
          >
            {loading ? (
              t('generating')
            ) : (
              <>
                <Sparkles size={24} className="fill-white" />
                <span className="text-lg shadow-black drop-shadow-sm">{t('generateButton')}</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <div className="z-10 mt-8 text-white/80 text-sm text-center font-medium drop-shadow-sm bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
        <p>{t('footer')}</p>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const router = useRouter();
    const t = useTranslations('Auth');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (!auth) throw new Error("Firebase auth is not initialized");
            await signInWithEmailAndPassword(auth, email, password);

            // Check for pending story
            const pendingStory = localStorage.getItem('pendingStory');
            if (pendingStory) {
                try {
                    const storyData = JSON.parse(pendingStory);
                    const queryParams = new URLSearchParams(storyData).toString();
                    localStorage.removeItem('pendingStory'); // Clear it immediately
                    router.push(`/story/generate?${queryParams}`);
                } catch (e) {
                    console.error("Error parsing pending story:", e);
                    router.push("/");
                }
            } else {
                router.push("/");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(t('errorGeneric'));
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResetMessage("");
        try {
            if (!auth) throw new Error("Firebase auth is not initialized");
            const { sendPasswordResetEmail } = await import("firebase/auth");
            await sendPasswordResetEmail(auth, email);
            setResetMessage(t('resetEmailSent'));
        } catch (err: any) {
            console.error(err);
            setError(t('errorGeneric'));
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/landing-bg.png')" }}
            >
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 z-10">
                <h1 className="mb-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
                    {isResettingPassword ? t('resetPasswordTitle') : t('loginTitle')}
                </h1>
                {error && <p className="mb-4 text-center text-red-300 font-bold bg-red-500/20 p-2 rounded-lg border border-red-500/50">{error}</p>}
                {resetMessage && <p className="mb-4 text-center text-green-300 font-bold bg-green-500/20 p-2 rounded-lg border border-green-500/50">{resetMessage}</p>}

                {!isResettingPassword ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setIsResettingPassword(true)}
                                className="text-sm text-yellow-300 hover:text-yellow-200 font-semibold"
                            >
                                {t('forgotPassword')}
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white font-extrabold py-3 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:mt-1 transition-all mt-4"
                        >
                            {t('loginButton')}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-1 ml-1 drop-shadow-sm">{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/30 text-white placeholder-white/70 transition-all font-medium"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white font-extrabold py-3 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:mt-1 transition-all mt-4"
                        >
                            {t('sendResetLink')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsResettingPassword(false)}
                            className="w-full mt-2 text-white/80 hover:text-white font-semibold"
                        >
                            {t('backToLogin')}
                        </button>
                    </form>
                )}

                {!isResettingPassword && (
                    <p className="mt-6 text-center text-white/90">
                        {t('noAccount')}{" "}
                        <Link href="/signup" className="font-bold text-yellow-400 hover:text-yellow-300 underline underline-offset-4">
                            {t('signupButton')}
                        </Link>
                    </p>
                )}
                <div className="mt-6 text-center border-t border-white/10 pt-4">
                    <Link href="/" className="text-white/70 hover:text-white font-medium inline-flex items-center gap-2 transition-colors text-sm">
                        ← {t('backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../../../navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Story } from '@/types';
import { saveStory } from '@/app/lib/storage';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';

function GenerateStoryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('GeneratePage');
    const locale = useLocale();
    const [status, setStatus] = useState(t('status_generating'));
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-500 to-blue-600 flex items-center justify-center text-white">
                <Sparkles size={64} className="text-yellow-300 animate-spin" />
            </div>
        );
    }

    useEffect(() => {
        if (loading || !user) return; // Wait for auth

        const generate = async () => {
            const name = searchParams.get('name');
            const age = searchParams.get('age');
            const interests = searchParams.get('interests');
            const theme = searchParams.get('theme');

            if (!name || !age) {
                router.push('/');
                return;
            }

            try {
                setStatus(t('status_magic', { name }));

                const response = await fetch('/api/generate-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, age, interests, theme, locale }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        console.error('Server Error (Non-JSON):', errorText);
                        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                    }
                    console.error('Server Error Details:', errorData);
                    throw new Error(errorData.details || errorData.error || t('error_generic'));
                }

                const story: Story = await response.json();

                // Save initial text-only story
                await saveStory(story);

                setStatus(t('status_images'));

                // Process images in parallel
                const imagePromises = story.pages.map(async (page, i) => {
                    try {
                        const imageResponse = await fetch('/api/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: page.imagePrompt }),
                        });

                        if (imageResponse.ok) {
                            const imageData = await imageResponse.json();
                            if (imageData.imageUrl) {
                                page.imageUrl = imageData.imageUrl;

                                // Preload image in browser
                                const img = new Image();
                                img.src = imageData.imageUrl;
                            }
                        } else {
                            const errorText = await imageResponse.text();
                            console.error(`Failed to generate image for page ${i + 1}. Status: ${imageResponse.status}. Error: ${errorText}`);
                        }
                    } catch (err) {
                        console.error(`Error fetching image for page ${i + 1}:`, err);
                    }
                });

                await Promise.all(imagePromises);

                // Save final story with all available images
                await saveStory(story);


                setStatus(t('status_ready'));
                // Short delay to let user see completion message
                setTimeout(() => {
                    router.push('/story/read');
                }, 1000);

            } catch (error) {
                console.error(error);
                setStatus(t('error_generic'));
                setTimeout(() => router.push('/'), 3000);
            }
        };

        generate();
    }, [searchParams, router, t, locale, user, loading]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-500 to-blue-600 flex flex-col items-center justify-center text-white p-4">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mb-8"
            >
                <Sparkles size={64} className="text-yellow-300" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-center mb-4"
            >
                {status}
            </motion.h2>

            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                />
            </div>
        </main>
    );
}

export default function GenerateStory() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-purple-500 to-blue-600 flex items-center justify-center text-white">
                <Sparkles size={64} className="text-yellow-300 animate-spin" />
            </div>
        }>
            <GenerateStoryContent />
        </Suspense>
    );
}

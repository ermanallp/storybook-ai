'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Story } from '@/types';
import { saveStory } from '@/app/lib/storage';

function GenerateStoryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Hikayen yazılıyor...');

    useEffect(() => {
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
                setStatus(`${name} için sihirli bir dünya yaratılıyor...`);

                const response = await fetch('/api/generate-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, age, interests, theme }),
                });

                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        const errorText = await response.text();
                        console.error('Server Error (Non-JSON):', errorText);
                        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                    }
                    console.error('Server Error Details:', errorData);
                    throw new Error(errorData.details || errorData.error || 'Hikaye oluşturulamadı');
                }

                const story: Story = await response.json();

                // Save initial text-only story
                await saveStory(story);

                // Process images sequentially to avoid rate limits and ensure completion
                for (let i = 0; i < story.pages.length; i++) {
                    const page = story.pages[i];
                    setStatus(`Resimler çiziliyor... (${i + 1}/${story.pages.length})`);

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
                                // Update storage incrementally so we don't lose progress if stuck
                                await saveStory(story);

                                // Preload image in browser
                                await new Promise((resolve) => {
                                    const img = new Image();
                                    img.src = imageData.imageUrl!;
                                    img.onload = resolve;
                                    img.onerror = resolve;
                                });
                            }
                        } else {
                            const errorText = await imageResponse.text();
                            console.error(`Failed to generate image for page ${i + 1}. Status: ${imageResponse.status}. Error: ${errorText}`);
                        }
                    } catch (err) {
                        console.error(`Error fetching image for page ${i + 1}:`, err);
                    }

                    // Add a small delay to avoid hitting rate limits too hard
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                setStatus('Hikayen hazır! Keyifli okumalar...');
                // Short delay to let user see completion message
                setTimeout(() => {
                    router.push('/story/read');
                }, 1000);

            } catch (error) {
                console.error(error);
                setStatus('Bir hata oluştu. Lütfen tekrar dene.');
                setTimeout(() => router.push('/'), 3000);
            }
        };

        generate();
    }, [searchParams, router]);

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

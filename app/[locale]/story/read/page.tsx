'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '../../../../navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { Story } from '@/types';
import { getStory } from '@/app/lib/storage';
import { useTranslations } from 'next-intl';

export default function ReadStory() {
    const router = useRouter();
    const t = useTranslations('ReadPage');
    const [story, setStory] = useState<Story | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [images, setImages] = useState<Record<number, string>>({});
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        const loadStory = async () => {
            const savedStory = await getStory();
            if (!savedStory) {
                router.push('/');
                return;
            }
            try {
                // savedStory is already a Story object, no need to parse JSON if we stored it as object in IDB.
                // However, our util stores it whole.
                setStory(savedStory);

                // Initialize images with any pre-fetched ones
                const initialImages: Record<number, string> = {};
                savedStory.pages.forEach((page, index) => {
                    if (page.imageUrl) {
                        initialImages[index] = page.imageUrl;
                    }
                });
                setImages(initialImages);
            } catch (e) {
                console.error("Failed to load story", e);
                router.push('/');
            }
        };

        loadStory();
    }, [router]);

    // Images are now pre-fetched in the generate step.
    // We keep the state sync just in case, or for future use.
    useEffect(() => {
        if (!story) return;

        // Sync local state with story images
        const currentImages: Record<number, string> = {};
        const loaded: Set<number> = new Set();

        story.pages.forEach((page, index) => {
            if (page.imageUrl) {
                currentImages[index] = page.imageUrl;
                loaded.add(index);
            }
        });

        setImages(currentImages);
        setLoadedImages(loaded);

    }, [story]);

    if (!story) return null;

    const handleNext = () => {
        if (currentPage < story.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <main className="min-h-screen bg-[#2c3e50] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Texture/Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Top Navigation */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => router.push('/')}
                    className="bg-white/10 text-white p-3 rounded-full backdrop-blur-md hover:bg-white/20 transition-all border border-white/20 shadow-lg group"
                >
                    <Home size={24} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl h-[85vh] md:h-auto md:aspect-[2/1] bg-[#fdf6e3] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden border-4 md:border-8 border-[#8b4513]">
                {/* Spine Effect (Middle) */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10 pointer-events-none"></div>

                {/* Left Page: Image */}
                <div className="w-full md:w-1/2 h-[40%] md:h-full shrink-0 relative bg-white border-r border-gray-200 overflow-hidden">
                    <div className="absolute inset-0 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)] pointer-events-none z-10"></div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex items-center justify-center bg-gray-100"
                        >
                            {images[currentPage] ? (
                                <>
                                    <img
                                        src={images[currentPage]}
                                        alt={`Page ${currentPage + 1}`}
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${loadedImages.has(currentPage) ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setLoadedImages(prev => new Set(prev).add(currentPage))}
                                        onError={(e) => {
                                            console.error("Image load error", e);
                                            e.currentTarget.style.display = 'none'; // Hide broken image
                                        }}
                                    />
                                    {!loadedImages.has(currentPage) && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-100">
                                            <div className="w-20 h-20 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-amber-700 font-serif text-lg">{t('loading_image')}</p>
                                            <p className="text-amber-600/60 text-sm mt-2 max-w-xs">{story.pages[currentPage].imagePrompt}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-20 h-20 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-amber-700 font-serif text-lg">{t('loading_image')}</p>
                                    <p className="text-amber-600/60 text-sm mt-2 max-w-xs">{story.pages[currentPage].imagePrompt}</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Page Number Left */}
                    <div className="absolute bottom-4 left-4 text-gray-400 font-serif text-sm z-20">
                        {currentPage * 2 + 1}
                    </div>
                </div>

                {/* Right Page: Text */}
                <div className="w-full md:w-1/2 flex-1 md:h-full relative bg-[#fffdf5] p-6 md:p-12 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 shadow-[inset_10px_0_20px_rgba(0,0,0,0.1)] pointer-events-none z-10"></div>

                    <div className="flex-1 flex items-start justify-center overflow-y-auto my-2 md:my-0 py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="prose prose-lg md:prose-xl text-center font-serif text-gray-800 leading-relaxed max-w-none px-4"
                            >
                                <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-amber-700 first-letter:mr-1 first-letter:float-left">
                                    {story.pages[currentPage].text}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-4 md:mt-8 z-20 relative shrink-0">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-serif transition-colors ${currentPage === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-amber-800 hover:bg-amber-100'
                                }`}
                        >
                            <ChevronLeft size={20} />
                            <span>{t('prev')}</span>
                        </button>

                        <div className="text-gray-400 font-serif text-sm">
                            {currentPage + 1} / {story.pages.length}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentPage === story.pages.length - 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-serif transition-colors ${currentPage === story.pages.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-amber-800 hover:bg-amber-100'
                                }`}
                        >
                            <span>{t('next')}</span>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Page Number Right */}
                    <div className="absolute bottom-4 right-4 text-gray-400 font-serif text-sm hidden md:block">
                        {currentPage * 2 + 2}
                    </div>
                </div>
            </div>
        </main>
    );
}

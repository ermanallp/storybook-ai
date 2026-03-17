'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TestimonialsComponent() {
    const t = useTranslations('Testimonials');
    const [currentIndex, setCurrentIndex] = useState(0);

    // We have 3 testimonials
    const testimonials = [
        { name: t('0.name'), text: t('0.text') },
        { name: t('1.name'), text: t('1.text') },
        { name: t('2.name'), text: t('2.text') },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 5000); // 5 seconds interval

        return () => clearInterval(timer);
    }, [testimonials.length]);

    return (
        <div className="w-full max-w-[340px] bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 relative overflow-hidden h-44 md:h-52 flex flex-col justify-center my-8 md:my-0 mx-auto md:mx-0">
            {/* Decorative background circle */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col items-center text-center z-10"
                >
                    {/* 5 Stars */}
                    <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>

                    <p className="text-white/90 text-sm md:text-base font-medium italic mb-4 px-2 line-clamp-3">
                        "{testimonials[currentIndex].text}"
                    </p>

                    <div className="mt-auto">
                        <p className="text-white font-bold tracking-wide">
                            {testimonials[currentIndex].name}
                        </p>
                        <p className="text-yellow-200/80 text-xs font-semibold uppercase tracking-wider mt-1">
                            {useTranslations('TestimonialsProps')('verifiedParent')}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {testimonials.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-yellow-400 w-4' : 'bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

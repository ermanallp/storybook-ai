'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const FAQComponent = () => {
    const t = useTranslations('HomePage.faq');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqData = [
        { question: t('q1'), answer: t('a1') },
        { question: t('q2'), answer: t('a2') },
        { question: t('q3'), answer: t('a3') }
    ];

    // Google JSON-LD Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="py-12 w-full max-w-3xl mx-auto z-10 relative">
            <div className="px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-md">
                    {t('title')}
                </h2>

                {/* Invisible Script for Google Bots JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div key={index} className="border border-white/20 rounded-xl bg-white/10 backdrop-blur-md overflow-hidden shadow-lg">
                            <button
                                className="w-full text-left p-5 focus:outline-none flex justify-between items-center hover:bg-white/20 transition-colors"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="font-semibold text-white/90 text-lg">{item.question}</span>
                                <span className="text-yellow-400 text-2xl font-light ml-4">
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="p-5 bg-black/20 text-blue-50 border-t border-white/10 leading-relaxed">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQComponent;

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicy() {
    const t = useTranslations('HomePage');

    return (
        <main className="min-h-screen relative flex flex-col items-center px-4 py-24 sm:p-8 overflow-hidden font-sans">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/landing-bg.png"
                    alt="Kidoredo Background"
                    fill
                    priority
                    quality={80}
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 text-white">
                <Link href="/" className="mb-8 inline-block text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                    &larr; {t('title')}
                </Link>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white drop-shadow-md">Privacy Policy</h1>

                <div className="prose prose-lg prose-invert max-w-none text-blue-50/90 leading-relaxed font-medium">
                    <p className="text-white/60 mb-8 border-b border-white/20 pb-4"><strong>Last Updated:</strong> February 2026</p>

                    <h2 className="text-2xl font-bold mt-10 mb-5 text-white drop-shadow-sm">1. Introduction</h2>
                    <p>Welcome to Kidoredo. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>

                    <h2 className="text-2xl font-bold mt-10 mb-5 text-white drop-shadow-sm">2. The Data We Collect About You</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2 opacity-90">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address.</li>
                        <li><strong>Profile Data</strong> includes your child's first name, age, and interests for the purpose of story generation.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-10 mb-5 text-white drop-shadow-sm">3. How We Use Your Data</h2>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2 opacity-90">
                        <li>To generate personalized stories using AI for your enjoyment.</li>
                        <li>To manage your account and provide customer support.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-10 mb-5 text-white drop-shadow-sm">4. Contact Us</h2>
                    <p>If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:hello@kidoredo.com" className="text-yellow-400 hover:text-yellow-300 transition-colors font-bold">hello@kidoredo.com</a>.</p>
                </div>
            </div>
        </main>
    );
}


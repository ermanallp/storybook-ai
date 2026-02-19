'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // @ts-ignore
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="flex justify-end mb-4 md:mb-0 pointer-events-none md:pointer-events-auto">
            <div className="pointer-events-auto">
                <select
                    defaultValue={locale}
                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 [&>option]:text-black"
                    onChange={onSelectChange}
                    disabled={isPending}
                >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="it">Italiano</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                </select>
            </div>
        </div>
    );
}

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://kidoredo.com';
    // Supported locales corresponding to messages and layout
    const languages = ['en', 'fr', 'de', 'es', 'it', 'tr', 'zh', 'ja', 'ko'];

    const sitemapEntries = languages.map((lang) => ({
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...sitemapEntries,
    ];
}

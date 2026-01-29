import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { GoogleTagManager } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kidoredo: Personalized AI Bedtime Stories for Kids",
    template: "%s | Kidoredo"
  },
  description: "Create magical, personalized AI stories where your child is the hero! Boost creativity and make bedtime fun with Kidoredo's custom books. Try for free.",
  keywords: ["Personalized AI Stories", "Custom Kids Books", "AI Bedtime Stories", "AI Story Generator", "Kişiselleştirilmiş Masallar", "Yapay Zeka Hikaye"],
  authors: [{ name: "Kidoredo Team" }],
  openGraph: {
    title: "Kidoredo: Personalized AI Bedtime Stories",
    description: "Make your child the hero of their own magical story.",
    type: "website",
    locale: "en_US",
    siteName: "Kidoredo",
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  // This is optional if middleware already handles redirects
  if (!['en', 'fr', 'de', 'es', 'it', 'tr', 'zh', 'ja', 'ko'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-N9W6VCBF" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Kidoredo",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Create magical, personalized AI stories where your child is the hero!",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "120"
                }
              }),
            }}
          />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

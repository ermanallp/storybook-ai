import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N9W6VCBF');
          `}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N9W6VCBF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
      </body>
    </html>
  );
}

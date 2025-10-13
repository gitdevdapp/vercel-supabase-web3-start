import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Web3 Starter Template - Multi-Chain dApp",
  description: "Open-source starter template for multi-chain Web3 applications. Production-ready code with Next.js and Supabase. Visit devdapp.com for setup guide.",
  keywords: ["Dapp", "decentralized applications", "web3", "blockchain", "ethereum", "starter template", "nextjs", "supabase", "template"],
  authors: [{ name: "DevDapp" }],
  creator: "DevDapp",
  publisher: "DevDapp",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: defaultUrl,
    title: "Web3 Starter Template - Multi-Chain dApp",
    description: "Open-source starter template for multi-chain Web3 applications. Production-ready code. Visit devdapp.com for deployment guide.",
    siteName: "Web3 Starter Template",
    images: [
      {
        url: `${defaultUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Web3 Starter Template - Multi-Chain dApp",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Web3 Starter Template - Multi-Chain dApp",
    description: "Open-source starter template for multi-chain Web3 applications. Visit devdapp.com for deployment guide.",
    images: [`${defaultUrl}/twitter-image.png`],
    creator: "@devdapp",
  },
  verification: {
    google: "verification-code-here",
  },
  alternates: {
    canonical: defaultUrl,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

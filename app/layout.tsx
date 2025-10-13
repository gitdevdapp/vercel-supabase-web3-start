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
  title: "Web3 Starter Kit - Multi-Chain dApp Framework",
  description: "Production-ready Web3 dApp framework supporting 6+ blockchains with enterprise authentication. Clone, configure, and deploy in 60 minutes.",
  keywords: ["Dapp", "decentralized applications", "web3", "blockchain", "ethereum", "starter template", "nextjs", "supabase"],
  authors: [{ name: "Web3 Starter Kit" }],
  creator: "Web3 Starter Kit",
  publisher: "Web3 Starter Kit",
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
    title: "Web3 Starter Kit - Multi-Chain dApp Framework",
    description: "Production-ready Web3 dApp framework supporting 6+ blockchains with enterprise authentication. Clone, configure, and deploy in 60 minutes.",
    siteName: "Web3 Starter Kit",
    images: [
      {
        url: `${defaultUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Web3 Starter Kit - Multi-Chain dApp Framework",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Web3 Starter Kit - Multi-Chain dApp Framework",
    description: "Production-ready Web3 dApp framework supporting 6+ blockchains with enterprise authentication.",
    images: [`${defaultUrl}/twitter-image.png`],
    creator: "@yourtwitterhandle",
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

import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "./NavBar";
import Footer from "./components/Footer";

const SITE_URL = 'https://lakive.com'
const SITE_NAME = 'Lakive'
const DEFAULT_TITLE = 'Lakive — From Data to Belonging'
const DEFAULT_DESC = 'Compare cities by cost of living, career opportunities, and housing affordability. Data-driven city intelligence for people deciding where to live and work in Canada.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s · Lakive',
  },
  description: DEFAULT_DESC,
  keywords: [
    'city comparison Canada', 'housing affordability Canada', 'best cities to live Canada',
    'Calgary vs Toronto', 'Vancouver cost of living', 'Canadian city rankings',
    'salary by city Canada', 'where to move Canada', 'city intelligence',
  ],
  authors: [{ name: 'Lakive', url: SITE_URL }],
  creator: 'Lakive',
  publisher: 'Lakive',
  icons: {
    icon: '/lakive-icon.svg',
    apple: '/lakive-icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: SITE_URL,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Lakive — City Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lakive',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: '4W1tuUk8yHbfrkan5AZ5lY82-YOiPua5NHl3rWU3ha4',
  },
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
};

// 显式声明 viewport，并锁定站点为浅色配色，
// 避免手机系统深色模式改写表单控件/滚动条等 UA 默认样式
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F5F7FB]">

        <NavBar />

        {/* 页面内容 */}
        {children}

        <Footer />

      </body>
    </html>
  );
}
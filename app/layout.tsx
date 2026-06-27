import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./NavBar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Lakive — Know Before You Move",
  description: "City intelligence platform for immigrants. Compare tax, housing, jobs and quality of life across Canadian cities — data-driven decisions for your move.",
  icons: {
    icon: "/lakive-icon.svg",
    apple: "/lakive-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-[#F5F7FB]">

        <NavBar />

        {/* 页面内容 */}
        {children}

        <Footer />

      </body>
    </html>
  );
}
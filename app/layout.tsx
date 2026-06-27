import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./NavBar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Lakive | Compare Cities by Cost of Living, Housing & Career Opportunities",
  description: "Compare cities by cost of living, career opportunities, housing affordability and quality of life. Make smarter relocation decisions with Lakive's data-driven city intelligence platform.",
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
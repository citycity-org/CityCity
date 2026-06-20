import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./NavBar";

export const metadata: Metadata = {
  title: "CityCity — 看清城市生活的真相",
  description: "See the real cost of city life. 加拿大城市生活成本对比平台。",
  icons: {
    icon: "/CityCity_Symbol.png",
    apple: "/CityCity_Symbol.png",
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

      </body>
    </html>
  );
}
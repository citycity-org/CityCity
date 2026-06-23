import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./NavBar";

export const metadata: Metadata = {
  title: "Lakive — Know Before You Move",
  description: "加拿大城市生活成本对比平台。数据驱动的移居决策工具。",
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

      </body>
    </html>
  );
}
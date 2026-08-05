import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "./NavBar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Lakive — From Data to Belonging",
  description: "Compare cities by cost of living, career opportunities, housing affordability and quality of life. Make smarter relocation decisions with Lakive's data-driven city intelligence platform.",
  icons: {
    icon: "/lakive-icon.svg",
    apple: "/lakive-icon.svg",
  },
  verification: {
    google: "4W1tuUk8yHbfrkan5AZ5lY82-YOiPua5NHl3rWU3ha4",
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
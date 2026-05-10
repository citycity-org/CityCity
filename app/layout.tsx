import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CityCity — 看清城市生活的真相",
  description: "See the real cost of city life. 加拿大城市生活成本对比平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-[#F5F7FB]">

        {/* 导航栏 */}
        <nav className="bg-white border-b border-[#E5E7EB] h-14 flex items-center px-8 justify-between sticky top-0 z-50">

          {/* 左边：Logo */}
          <a href="/" className="text-xl font-bold" style={{
            background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CityCity
          </a>

          {/* 中间：三个目的按钮 */}
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)'}}>
              🏠 买房
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium text-[#6B7280] border border-[#E5E7EB] bg-white">
              🔑 租房
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium text-[#6B7280] border border-[#E5E7EB] bg-white">
              🚗 买车
            </button>
          </div>

          {/* 右边：语言切换 */}
          <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-1">
            <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-[#111827] shadow-sm">
              中文
            </button>
            <button className="px-3 py-1 rounded-md text-sm font-medium text-[#9CA3AF]">
              EN
            </button>
          </div>

        </nav>

        {/* 页面内容 */}
        {children}

      </body>
    </html>
  );
}
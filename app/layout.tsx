import type { Metadata } from "next";
import "./globals.css";

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

        {/* 导航栏 */}
        <nav className="bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6 justify-between sticky top-0 z-50">

          {/* 左边：Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/CityCity_Symbol.png"
              alt="CityCity"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CityCity
            </span>
          </a>

          {/* 中间：导航链接 */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/ranking"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all">
              排行榜
            </a>
            <a href="/compare"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all">
              城市对比
            </a>
            <a href="/subscribe"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all">
              订阅
            </a>
          </div>

          {/* 右边：语言切换 */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-1">
              <a href="/" className="px-3 py-1 rounded-md text-sm font-medium bg-white text-[#111827] shadow-sm">
  中文
</a>
<a href="/en" className="px-3 py-1 rounded-md text-sm font-medium text-[#9CA3AF] hover:text-[#111827]">
  EN
</a>
            </div>
          </div>

        </nav>

        {/* 页面内容 */}
        {children}

      </body>
    </html>
  );
}
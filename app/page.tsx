export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
      <div className="text-center">

        {/* Logo */}
        <div className="mb-8">
          <span className="text-5xl font-bold" style={{
            background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CityCity
          </span>
        </div>

        {/* Slogan */}
        <p className="text-xl text-[#374151] font-medium">
          看清城市生活的真相
        </p>
        <p className="text-base text-[#9CA3AF] mt-1">
          See the real cost of city life
        </p>

        {/* 开始按钮 */}
        <button className="mt-10 px-8 py-3 rounded-full text-white font-semibold text-base"
          style={{background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)'}}>
          开始查询 →
        </button>

      </div>
    </main>
  )
}
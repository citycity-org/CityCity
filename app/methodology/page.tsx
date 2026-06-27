export const metadata = {
  title: 'Report Methodology — Lakive',
  description: 'How Lakive collects data, builds city scores, and generates intelligence reports.',
}

const DIMENSIONS = [
  { id: 'TAI', name: 'Tax Advantage Index', weight: '20%', desc: '联邦+省级所得税、消费税（GST/HST/PST/QST）综合税负评分。税率越低分数越高。', source: 'Canada Revenue Agency (CRA)' },
  { id: 'EOI', name: 'Employment Opportunity Index', weight: '20%', desc: '职业就业率、失业率、职位空缺密度，按职业类别加权。', source: 'Statistics Canada Labour Force Survey, Job Bank' },
  { id: 'HAI', name: 'Housing Affordability Index', weight: '25%', desc: '房价收入比（HPI / 职业年薪）+ 租金收入比，按选定房型计算。', source: 'CREA MLS HPI, CMHC Rental Market Report' },
  { id: 'EQI', name: 'Environment Quality Index', weight: '15%', desc: '气候适宜性、空气质量、绿地覆盖率、自然灾害风险等综合评分。', source: 'Environment and Climate Change Canada, StatCan' },
  { id: 'TCI', name: 'Transit & Connectivity Index', weight: '10%', desc: '公共交通覆盖率、通勤时间、骑行/步行友好度。', source: 'StatCan Commuting Flow, TransitApp' },
  { id: 'PSI', name: 'Public Services Index', weight: '5%', desc: '医疗资源密度（医生/千人）、学校评分、公共图书馆和社区服务覆盖。', source: 'CIHI, Fraser Institute School Rankings' },
  { id: 'EDI', name: 'Economic Diversity Index', weight: '5%', desc: '城市经济多元化程度，衡量对单一行业的依赖风险。', source: 'Statistics Canada, Conference Board of Canada' },
]

export default function MethodologyPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Transparency</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Report Methodology</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7 }}>
            Lakive 的城市评分完全基于公开数据，方法论透明可验证。这里是我们如何构建每一个指数的完整说明。
          </p>
        </div>

        {/* Data philosophy */}
        <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 16, padding: '24px 28px', marginBottom: 48 }}>
          <div style={{ color: '#4F8EF7', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>核心原则</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8 }}>
            城市选择是人生中最重要的决定之一。Lakive 相信每个人都应该获得与专业顾问相同质量的数据，而不是依赖口口相传或营销材料。我们的所有数据均来自加拿大官方统计机构，不接受城市或企业的赞助来影响评分。
          </div>
        </div>

        {/* Composite score */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>综合城市指数（DCI）</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            每个城市的综合指数是7个维度指数的加权平均，满分100分。权重根据对新移民生活质量影响程度设计，并根据用户职业动态调整就业维度权重。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DIMENSIONS.map(d => (
              <div key={d.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>{d.id}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 700 }}>权重 {d.weight}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{d.desc}</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>数据来源：{d.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation adjustment */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>职业个性化调整</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8 }}>
            当用户选择职业后，Lakive 会将住房可负担性（HAI）和就业机会（EOI）的计算切换为该职业的具体薪资数据，而非城市平均收入。这使得评分真正反映"你"在这座城市的生活成本，而不是平均人口的数据。
          </p>
        </div>

        {/* Update schedule */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>数据更新频率</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { freq: '每月', item: '房价数据（CREA MLS HPI）' },
              { freq: '每季度', item: '租金数据、就业指数、综合评分' },
              { freq: '每年', item: '税率、职业收入、公共服务指数' },
            ].map(r => (
              <div key={r.freq} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 18px' }}>
                <span style={{ color: '#14B8A6', fontWeight: 700, fontSize: 13, minWidth: 60 }}>{r.freq}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{r.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 22px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.8 }}>
            所有评分仅供参考，不构成投资、移民或法律建议。数据基于公开来源，Lakive 不对数据的绝对准确性作出保证。详见 <a href="/disclaimer" style={{ color: '#4F8EF7' }}>Disclaimer</a>。
          </p>
        </div>

      </div>
    </main>
  )
}

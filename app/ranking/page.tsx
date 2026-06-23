'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
type EoiVal = '强'|'中'|'弱'
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: EoiVal }

// ── Occupation list ───────────────────────────────────────────────────────────
const OCCUPATIONS = [
  { id:'electrician',  name:'电工'       },
  { id:'software_eng', name:'软件工程师' },
  { id:'nurse',        name:'注册护士'   },
  { id:'teacher',      name:'中学教师'   },
  { id:'truck_driver', name:'卡车司机'   },
  { id:'accountant',   name:'会计师'     },
  { id:'police',       name:'警察'       },
  { id:'retail',       name:'零售店员'   },
]

// ── Region list ───────────────────────────────────────────────────────────────
const REGIONS = [
  { id:'canada', label:'加拿大', subLabel:'全国', cities:['vancouver','toronto','calgary','montreal','ottawa'] },
  { id:'bc',     label:'BC省',   subLabel:'不列颠哥伦比亚', cities:['vancouver'] },
  { id:'ab',     label:'AB省',   subLabel:'艾伯塔', cities:['calgary'] },
  { id:'on',     label:'ON省',   subLabel:'安大略', cities:['toronto','ottawa'] },
  { id:'qc',     label:'QC省',   subLabel:'魁北克', cities:['montreal'] },
]

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1居室',   priceMult: 0.70, rentMult: 0.78 },
  { id: '2br',       label: '2居室',   priceMult: 1.00, rentMult: 1.00 },
  { id: '3br',       label: '3居室',   priceMult: 1.38, rentMult: 1.35 },
  { id: 'townhouse', label: '联排别墅', priceMult: 1.55, rentMult: 1.45 },
  { id: 'detached',  label: '独立屋',  priceMult: 2.20, rentMult: 1.70 },
]

// ── Sort dimensions ───────────────────────────────────────────────────────────
const SORT_DIMS = [
  { id:'score',    label:'综合适配分', lowerBetter:false },
  { id:'hpiYears', label:'买房年数',   lowerBetter:true  },
  { id:'rpi',      label:'租金压力',   lowerBetter:true  },
  { id:'tai',      label:'税后指数',   lowerBetter:false },
  { id:'eoi',      label:'就业机会',   lowerBetter:false },
  { id:'hai',      label:'医疗',       lowerBetter:false },
  { id:'eqi',      label:'环境',       lowerBetter:false },
  { id:'tci',      label:'交通',       lowerBetter:false },
  { id:'psi',      label:'安全',       lowerBetter:false },
  { id:'edi',      label:'教育',       lowerBetter:false },
]

// ── Fit matrix ────────────────────────────────────────────────────────────────
const FIT_MATRIX: Record<string, Record<string, OccFit>> = {
  vancouver: {
    electrician:  { score:72, hpiYears:13.0, rpi:42, eoi:'强' },
    software_eng: { score:84, hpiYears:9.5,  rpi:36, eoi:'强' },
    nurse:        { score:68, hpiYears:12.8, rpi:43, eoi:'中' },
    teacher:      { score:62, hpiYears:14.0, rpi:46, eoi:'中' },
    truck_driver: { score:52, hpiYears:16.5, rpi:54, eoi:'中' },
    accountant:   { score:65, hpiYears:15.2, rpi:49, eoi:'中' },
    police:       { score:70, hpiYears:12.5, rpi:41, eoi:'强' },
    retail:       { score:32, hpiYears:26.0, rpi:68, eoi:'中' },
  },
  toronto: {
    electrician:  { score:70, hpiYears:12.5, rpi:40, eoi:'强' },
    software_eng: { score:88, hpiYears:9.2,  rpi:34, eoi:'强' },
    nurse:        { score:72, hpiYears:12.0, rpi:41, eoi:'强' },
    teacher:      { score:65, hpiYears:13.2, rpi:44, eoi:'强' },
    truck_driver: { score:55, hpiYears:15.8, rpi:52, eoi:'中' },
    accountant:   { score:72, hpiYears:13.8, rpi:46, eoi:'强' },
    police:       { score:68, hpiYears:11.8, rpi:40, eoi:'强' },
    retail:       { score:30, hpiYears:24.5, rpi:65, eoi:'中' },
  },
  calgary: {
    electrician:  { score:91, hpiYears:3.9,  rpi:24, eoi:'强' },
    software_eng: { score:78, hpiYears:5.2,  rpi:28, eoi:'中' },
    nurse:        { score:86, hpiYears:4.5,  rpi:25, eoi:'强' },
    teacher:      { score:80, hpiYears:5.8,  rpi:28, eoi:'中' },
    truck_driver: { score:82, hpiYears:5.5,  rpi:26, eoi:'强' },
    accountant:   { score:78, hpiYears:6.2,  rpi:30, eoi:'中' },
    police:       { score:84, hpiYears:4.8,  rpi:25, eoi:'强' },
    retail:       { score:52, hpiYears:13.2, rpi:42, eoi:'中' },
  },
  montreal: {
    electrician:  { score:68, hpiYears:5.5,  rpi:30, eoi:'中' },
    software_eng: { score:70, hpiYears:5.2,  rpi:28, eoi:'中' },
    nurse:        { score:65, hpiYears:6.0,  rpi:32, eoi:'中' },
    teacher:      { score:68, hpiYears:5.8,  rpi:30, eoi:'中' },
    truck_driver: { score:60, hpiYears:7.2,  rpi:36, eoi:'中' },
    accountant:   { score:62, hpiYears:6.8,  rpi:34, eoi:'中' },
    police:       { score:65, hpiYears:6.5,  rpi:32, eoi:'中' },
    retail:       { score:45, hpiYears:13.5, rpi:44, eoi:'弱' },
  },
  ottawa: {
    electrician:  { score:74, hpiYears:6.8,  rpi:28, eoi:'中' },
    software_eng: { score:80, hpiYears:6.2,  rpi:26, eoi:'强' },
    nurse:        { score:82, hpiYears:6.5,  rpi:27, eoi:'强' },
    teacher:      { score:80, hpiYears:7.0,  rpi:28, eoi:'强' },
    truck_driver: { score:65, hpiYears:8.5,  rpi:34, eoi:'中' },
    accountant:   { score:74, hpiYears:7.8,  rpi:30, eoi:'中' },
    police:       { score:80, hpiYears:6.8,  rpi:28, eoi:'强' },
    retail:       { score:44, hpiYears:16.0, rpi:50, eoi:'弱' },
  },
}

// ── City base ─────────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name:string; province:string; short:string
  eoi:number; tai:number; hai:number; eqi:number; tci:number; psi:number; edi:number
  taiNote:string
}> = {
  vancouver: { name:'温哥华',   province:'BC', short:'YVR', eoi:80, tai:72, hai:88, eqi:90, tci:82, psi:72, edi:80, taiNote:'GST 5%+PST 7%' },
  toronto:   { name:'多伦多',   province:'ON', short:'YYZ', eoi:92, tai:68, hai:90, eqi:75, tci:78, psi:68, edi:82, taiNote:'HST 13%' },
  calgary:   { name:'卡尔加里', province:'AB', short:'YYC', eoi:65, tai:90, hai:78, eqi:82, tci:48, psi:78, edi:72, taiNote:'仅GST 5%' },
  montreal:  { name:'蒙特利尔', province:'QC', short:'YUL', eoi:72, tai:42, hai:75, eqi:78, tci:72, psi:70, edi:80, taiNote:'GST+QST≈15%' },
  ottawa:    { name:'渥太华',   province:'ON', short:'YOW', eoi:75, tai:68, hai:82, eqi:80, tci:55, psi:82, edi:85, taiNote:'HST 13%' },
}

// ── Insights（语气中性，不绝对化）────────────────────────────────────────────
const INSIGHTS: Record<string, Record<string, string>> = {
  calgary: {
    electrician:  '买房年数较低（3.9年），税后收入优势明显（TAI 90），电工就业需求较强——是技工群体值得优先比较的城市。',
    nurse:        'AB省无PST，税后收入优势突出；买房压力相对较低（4.5年），医疗就业较稳定，综合性价比较高。',
    truck_driver: '运输物流岗位集中，无省级PST，消费成本低；城市持续扩张带来稳定的岗位需求。',
    software_eng: '税后优势显著、买房压力较低（5.2年），适合重视财务积累的工程师；科技生态规模相对有限。',
    default:      'AB省无省级PST，税后收入优势较强；买房年数相对低，是技术与蓝领职业值得重点考量的城市。',
  },
  toronto: {
    software_eng: '就业机会指数较高（EOI 92），科技薪资竞争力强，但住房负担明显（12.5年）——适合以职业发展为优先的人群。',
    nurse:        '医疗就业机会丰富、薪资具竞争力，但租金占收入比较高（41%），需结合个人财务情况评估。',
    electrician:  '就业机会相对充裕，但买房需 12.5 年，与卡尔加里（3.9年）相比住房压力明显更高。',
    default:      '就业机会指数全国较高（EOI 92），但住房压力较严峻——更适合把职业发展放在优先位置的人群。',
  },
  vancouver: {
    software_eng: '科技产业氛围较浓，薪资具吸引力，但房价收入比较高——适合已有住房资产或能接受高租金的群体。',
    electrician:  '高房价对蓝领职业影响显著：买房需 13 年，建议与卡尔加里（3.9年）作对比后再做决策。',
    nurse:        '医疗需求持续，但买房需 12.8 年，租金占收入约 42%——需结合个人长期财务规划综合评估。',
    default:      '气候与环境在主要城市中较优，但住房负担处于较高水平——城市生活质量与住房成本之间存在明显权衡。',
  },
  montreal: {
    teacher:      '教育资源较丰富，法英双语背景有竞争优势，买房压力相对较低（5.5年）。',
    electrician:  '买房年数较低（5.5年），就业机会适中，适合寻求住房可负担性的技工群体。',
    default:      '住房负担相对可控，生活成本较低，但QC省所得税税率较高，会影响税后净收入。',
  },
  ottawa: {
    software_eng: '联邦政府科技部门岗位集中，就业较稳定；薪资与多伦多有差距，但生活压力相对较小。',
    nurse:        '联邦及省级医疗就业较稳定，环境质量较好，租住压力低于温哥华和多伦多。',
    default:      '联邦政府岗位密集，环境质量较优，适合偏好工作稳定与生活质量并重的群体。',
  },
}

function getInsight(cityId:string, occ:string):string {
  const m = INSIGHTS[cityId]
  return m?.[occ] ?? m?.default ?? ''
}

// ── Auto-generate ranking title ───────────────────────────────────────────────
function getRankingTitle(regionId:string, occName:string, sortId:string):string {
  const region = REGIONS.find(r=>r.id===regionId)?.label ?? '加拿大'
  if (sortId === 'score')    return `${region}最适合${occName}的城市排行`
  if (sortId === 'hpiYears') return `${region}对${occName}买房压力最小的城市排行`
  if (sortId === 'rpi')      return `${region}对${occName}租金压力最低的城市排行`
  if (sortId === 'tai')      return `${region}税后指数最高的城市排行`
  if (sortId === 'eoi')      return `${region}${occName}就业机会最多的城市排行`
  const sortLabel = SORT_DIMS.find(d=>d.id===sortId)?.label ?? ''
  return `${region}${occName}${sortLabel}排行`
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s:number) => s>=80?'#14B8A6':s>=70?'#F59E0B':s>=55?'#F59E0B':s>=40?'#E86C2F':'#EF4444'
const hc = (y:number) => y<6?'#14B8A6':y<10?'#F59E0B':y<14?'#E86C2F':'#EF4444'
const rc = (r:number) => r<30?'#14B8A6':r<38?'#F59E0B':r<45?'#E86C2F':'#EF4444'
const dc = (v:number) => v>=80?'#14B8A6':v>=65?'#60A5FA':'#F59E0B'

const rankStyle = (r:number) => {
  if (r===1) return { color:'#14B8A6', bg:'rgba(20,184,166,0.15)', border:'rgba(20,184,166,0.35)' }
  if (r===2) return { color:'#60A5FA', bg:'rgba(96,165,250,0.12)', border:'rgba(96,165,250,0.28)' }
  if (r===3) return { color:'#F59E0B', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.28)' }
  return           { color:'rgba(255,255,255,0.28)', bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.12)' }
}

function getSortValue(cityId:string, occ:string, dimId:string):number {
  const fit  = FIT_MATRIX[cityId]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }
  const city = CITY_BASE[cityId]
  switch(dimId) {
    case 'score':    return fit.score
    case 'hpiYears': return fit.hpiYears
    case 'rpi':      return fit.rpi
    case 'tai':      return city?.tai ?? 0
    case 'eoi':      return city?.eoi ?? 0
    case 'hai':      return city?.hai ?? 0
    case 'eqi':      return city?.eqi ?? 0
    case 'tci':      return city?.tci ?? 0
    case 'psi':      return city?.psi ?? 0
    case 'edi':      return city?.edi ?? 0
    default:         return 0
  }
}

// ── Dropdown component ────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }: {
  label: string
  value: string
  options: { id:string; name:string; sub?:string }[]
  onChange: (id:string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o=>o.id===value)
  return (
    <div style={{ position:'relative' }}>
      <button onClick={()=>setOpen(!open)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', whiteSpace:'nowrap' }}>
        <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>{label}</span>
        <span style={{ color:'white', fontSize:14, fontWeight:700 }}>{current?.name}</span>
        <span style={{ color:'rgba(255,255,255,0.50)', fontSize:11 }}>▾</span>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, minWidth:160, background:'#1a2035', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, overflow:'hidden', zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          {options.map(o=>(
            <button key={o.id}
              onClick={()=>{ onChange(o.id); setOpen(false) }}
              style={{ width:'100%', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:o.id===value?'rgba(79,142,247,0.10)':'transparent', border:'none', textAlign:'left' }}>
              <span style={{ color:'rgba(255,255,255,0.82)', fontSize:13, fontWeight:o.id===value?700:400 }}>{o.name}</span>
              {o.sub && <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{o.sub}</span>}
            </button>
          ))}
        </div>
      )}
      {open && <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const [region,      setRegion     ] = useState('canada')
  const [occ,         setOcc        ] = useState('electrician')
  const [sortDim,     setSortDim    ] = useState('score')
  const [propType,    setPropType   ] = useState('2br')
  const [expanded,    setExpanded   ] = useState<string|null>(null)
  const [liveHpi,     setLiveHpi    ] = useState<Record<string,number>>({})
  const [currentCity, setCurrentCity] = useState<string|null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const o = p.get('occupation')
    if (o && FIT_MATRIX.vancouver[o]) setOcc(o)
    const r = p.get('region')
    if (r && REGIONS.find(x=>x.id===r)) setRegion(r)
    const c = p.get('current')
    if (c && CITY_BASE[c]) setCurrentCity(c)
    const h = p.get('housing')
    if (h && PROP_TYPES.find(pt=>pt.id===h)) setPropType(h)
  }, [])

  useEffect(() => {
    async function fetchHpi() {
      const { data } = await supabase
        .from('housing_years').select('city_id, years_current')
        .eq('occupation_id', occ).eq('property_type', '2br_condo')
      if (data?.length) {
        const m: Record<string,number> = {}
        data.forEach((r:{city_id:string;years_current:number}) => {
          m[r.city_id] = parseFloat(String(r.years_current))
        })
        setLiveHpi(m)
      }
    }
    fetchHpi()
  }, [occ])

  const occName   = OCCUPATIONS.find(o=>o.id===occ)?.name ?? occ
  const regionObj = REGIONS.find(r=>r.id===region)!
  const dim       = SORT_DIMS.find(d=>d.id===sortDim)!
  const title     = getRankingTitle(region, occName, sortDim)

  // Build + sort city list
  const prop = PROP_TYPES.find(pt=>pt.id===propType) ?? PROP_TYPES[1]
  const allCities = regionObj.cities
    .filter(id => CITY_BASE[id])
    .map(id => {
      const fit      = FIT_MATRIX[id]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }
      const city     = CITY_BASE[id]
      const baseHpi  = liveHpi[id] ?? fit.hpiYears
      const hpiYears = parseFloat((baseHpi * prop.priceMult).toFixed(1))
      const rpi      = Math.round(fit.rpi * prop.rentMult)
      return { id, city, fit:{ ...fit, hpiYears, rpi }, insight:getInsight(id, occ) }
    })
    .sort((a,b) => {
      const vA = getSortValue(a.id, occ, sortDim)
      const vB = getSortValue(b.id, occ, sortDim)
      return dim.lowerBetter ? vA-vB : vB-vA
    })

  // Current city position
  const currentRank = currentCity ? allCities.findIndex(c=>c.id===currentCity)+1 : null

  return (
    <main style={{ minHeight:'100vh', background:'#0d1117' }}>
      <style>{`
        .city-card { transition: border-color 0.15s; }
        .city-card:hover { border-color: rgba(255,255,255,0.18) !important; }
        .card-main-row { cursor: pointer; }
        .quick-link { opacity:0.7; transition:opacity 0.15s; }
        .quick-link:hover { opacity:1; }
        @media (max-width:700px) {
          .metrics-row  { grid-template-columns:repeat(2,1fr) !important; }
          .dim-grid     { grid-template-columns:1fr !important; }
          .cta-grid     { grid-template-columns:1fr !important; }
          .page-cta     { flex-direction:column !important; }
        }
      `}</style>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0d1117 0%,#151827 60%,#1a2035 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'28px 32px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          <div style={{ color:'rgba(255,255,255,0.50)', fontSize:12, marginBottom:16 }}>Lakive · 城市适配榜</div>

          <div style={{ marginBottom:20 }}>
            <h1 style={{ color:'white', fontSize:28, fontWeight:900, margin:'0 0 6px', letterSpacing:'-0.5px' }}>城市适配榜</h1>
            <p style={{ color:'rgba(255,255,255,0.32)', fontSize:13, margin:0 }}>
              不是城市好坏排名，而是某个职业在不同城市的生活适配度排名。
            </p>
          </div>

          {/* ── Filter bar ── */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <FilterDropdown
              label="区域"
              value={region}
              options={REGIONS.map(r=>({ id:r.id, name:r.label, sub:r.subLabel }))}
              onChange={v=>{ setRegion(v); setExpanded(null) }}
            />
            <FilterDropdown
              label="职业"
              value={occ}
              options={OCCUPATIONS.map(o=>({ id:o.id, name:o.name }))}
              onChange={v=>{ setOcc(v); setExpanded(null) }}
            />
            <FilterDropdown
              label="排序"
              value={sortDim}
              options={SORT_DIMS.map(d=>({ id:d.id, name:d.label }))}
              onChange={v=>{ setSortDim(v); setExpanded(null) }}
            />
            {/* Housing toggle */}
            <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3 }}>
              {PROP_TYPES.map(pt=>(
                <button key={pt.id}
                  onClick={()=>{ setPropType(pt.id); setExpanded(null) }}
                  style={{ padding:'6px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, transition:'all 0.15s',
                    background: propType===pt.id ? 'rgba(79,142,247,0.25)' : 'transparent',
                    color:      propType===pt.id ? '#93C5FD' : 'rgba(255,255,255,0.45)',
                  }}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 32px' }}>

        {/* ── Current city position banner ── */}
        {currentCity && currentRank && (
          <div style={{ marginBottom:16, padding:'10px 16px', background:'rgba(79,142,247,0.08)', border:'1px solid rgba(79,142,247,0.20)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ color:'#60A5FA', fontSize:13 }}>📍</span>
            <span style={{ color:'rgba(255,255,255,0.65)', fontSize:13 }}>
              <strong style={{ color:'white' }}>{CITY_BASE[currentCity].name}</strong>
              {' '}在{regionObj.label}{occName}适配榜中排名第
              {' '}<strong style={{ color:rankStyle(currentRank).color }}>{currentRank}</strong>
              {' '}/ {allCities.length}
            </span>
          </div>
        )}

        {/* ── Ranking title ── */}
        <div style={{ marginBottom:20, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <h2 style={{ color:'#FFFFFF', fontSize:26, fontWeight:800, margin:'0 0 4px' }}>{title}</h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, fontWeight:500, margin:'0 0 6px' }}>
              Top {allCities.length} 预览 · 基于{occName}职业校准
            </p>
            <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, margin:0 }}>
              该榜单基于职业与城市公共数据，不含你的家庭收入、首付、孩子、通勤和生活偏好。
            </p>
          </div>
          {/* Light top CTA */}
          <a href={`/calculate?occupation=${occ}`}
            style={{ padding:'9px 16px', borderRadius:10, background:'rgba(79,142,247,0.12)', border:'1px solid rgba(79,142,247,0.28)', color:'#60A5FA', fontSize:13, fontWeight:700, textDecoration:'none', flexShrink:0, whiteSpace:'nowrap', alignSelf:'flex-start', marginTop:4 }}>
            用我的情况计算 →
          </a>
        </div>

        {/* ── City cards ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
          {allCities.map(({ id, city, fit, insight }, index) => {
            const rank      = index + 1
            const rs        = rankStyle(rank)
            const isOpen    = expanded === id
            const isCurrent = id === currentCity
            // For compare link: pick the #1 city if it's not this city, else #2
            const compareTo = allCities.find(c=>c.id!==id)?.id ?? 'calgary'

            return (
              <div key={id} className="city-card"
                style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${isCurrent?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:18, overflow:'hidden' }}>

                {/* Main row */}
                <div className="card-main-row"
                  style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'52px 1fr auto', gap:16, alignItems:'center' }}
                  onClick={()=>setExpanded(isOpen?null:id)}>

                  {/* Rank badge */}
                  <div style={{ width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:rs.bg, border:`1px solid ${rs.border}`, flexShrink:0 }}>
                    <span style={{ color:rs.color, fontSize:20, fontWeight:900, fontFamily:'monospace' }}>{rank}</span>
                  </div>

                  {/* City name + metrics */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <span style={{ color:'white', fontSize:18, fontWeight:800 }}>{city.name}</span>
                      <span style={{ color:'rgba(255,255,255,0.50)', fontSize:12 }}>{city.province}</span>
                      {isCurrent && (
                        <span style={{ padding:'2px 7px', borderRadius:6, background:'rgba(79,142,247,0.15)', border:'1px solid rgba(79,142,247,0.30)', color:'#60A5FA', fontSize:10, fontWeight:700 }}>当前城市</span>
                      )}
                    </div>
                    <div className="metrics-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                      {[
                        { label:'买房年收入', val:`${fit.hpiYears}年收入`,  color:hc(fit.hpiYears), mono:true  },
                        { label:'租金压力', val:`${fit.rpi}%`,        color:rc(fit.rpi),      mono:true  },
                        { label:'税后指数', val:String(city.tai),     color:dc(city.tai),     mono:true  },
                        { label:'就业机会', val:fit.eoi,              color:fit.eoi==='强'?'#14B8A6':fit.eoi==='中'?'#F59E0B':'#E86C2F', mono:false },
                      ].map(m=>(
                        <div key={m.label}>
                          <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginBottom:2 }}>{m.label}</div>
                          <div style={{ color:m.color, fontSize:15, fontWeight:800, fontFamily:m.mono?'monospace':'inherit' }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score + chevron */}
                  <div style={{ textAlign:'center', flexShrink:0 }}>
                    <div style={{ color:sc(fit.score), fontSize:44, fontWeight:900, fontFamily:'monospace', lineHeight:1, letterSpacing:'-2px' }}>{fit.score}</div>
                    <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginBottom:8 }}>/ 100</div>
                    <div style={{ color:'rgba(255,255,255,0.50)', fontSize:12, transform:isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</div>
                  </div>
                </div>

                {/* Insight + quick actions */}
                {insight && (
                  <div style={{ margin:'0 24px 16px', padding:'10px 14px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.16)', borderRadius:10 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
                      <span style={{ color:'#F59E0B', fontSize:13, flexShrink:0, lineHeight:'20px' }}>💡</span>
                      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, lineHeight:1.65, margin:0 }}>{insight}</p>
                    </div>
                    {/* Quick action links */}
                    <div style={{ display:'flex', gap:14, paddingTop:6, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <a href={`/city/${id}?occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        className="quick-link"
                        style={{ color:'#60A5FA', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                        查看城市详情 →
                      </a>
                      <a href={`/compare?cities=${id},${compareTo}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        className="quick-link"
                        style={{ color:'rgba(255,255,255,0.40)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                        与{CITY_BASE[compareTo]?.name ?? '其他城市'}对比 →
                      </a>
                    </div>
                  </div>
                )}

                {/* ── Expanded ── */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px' }}>

                    <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', marginBottom:12 }}>完整维度</div>

                    <div className="dim-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:20 }}>
                      {[
                        { label:'综合适配分',   val:String(fit.score),                       color:sc(fit.score),    mono:true  },
                        { label:'买房/年收入',   val:`${fit.hpiYears}年收入`,                color:hc(fit.hpiYears), mono:true  },
                        { label:'租金压力',      val:`${fit.rpi}%`,                          color:rc(fit.rpi),      mono:true  },
                        { label:'就业机会',      val:`${city.eoi} (${fit.eoi})`,             color:city.eoi>=75?'#14B8A6':city.eoi>=55?'#F59E0B':'#E86C2F', mono:true },
                        { label:'税后指数',        val:String(city.tai),                       color:dc(city.tai),     mono:false },
                        { label:'医疗可及',      val:String(city.hai),                       color:dc(city.hai),     mono:false },
                        { label:'环境质量',      val:String(city.eqi),                       color:dc(city.eqi),     mono:false },
                        { label:'公共交通',      val:String(city.tci),                       color:dc(city.tci),     mono:false },
                        { label:'公共安全',      val:String(city.psi),                       color:dc(city.psi),     mono:false },
                        { label:'教育资源',      val:String(city.edi),                       color:dc(city.edi),     mono:false },
                      ].map(m=>(
                        <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'rgba(255,255,255,0.025)', borderRadius:8 }}>
                          <span style={{ color:'rgba(255,255,255,0.40)', fontSize:12 }}>{m.label}</span>
                          <span style={{ color:m.color, fontSize:14, fontWeight:800, fontFamily:m.mono?'monospace':'inherit' }}>{m.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Per-card CTAs */}
                    <div className="cta-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                      <a href={`/calculate?city=${id}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:10, marginBottom:2 }}>个人化计算</div>
                        <div style={{ color:'white', fontWeight:700, fontSize:12 }}>用我的情况算{city.name} →</div>
                      </a>
                      <a href={`/city/${id}?occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.50)', fontSize:11, marginBottom:2 }}>深入分析</div>
                        <div style={{ color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:12 }}>城市详情 →</div>
                      </a>
                      <a href={`/compare?cities=${id},${compareTo}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.50)', fontSize:11, marginBottom:2 }}>横向对比</div>
                        <div style={{ color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:12 }}>与其他城市比 →</div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── More cities ── */}
        <div style={{ textAlign:'center', marginBottom:28, padding:'20px 24px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:'0 0 12px' }}>
            当前显示 Top {allCities.length} 城市 · 完整城市库持续扩展中
          </p>
          <button disabled
            style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.30)', fontSize:13, fontWeight:700, cursor:'not-allowed' }}>
            查看更多城市 · 即将上线
          </button>
        </div>

        {/* ── Page-level CTA to Calculate ── */}
        <div className="page-cta" style={{ background:'rgba(79,142,247,0.07)', border:'1px solid rgba(79,142,247,0.20)', borderRadius:18, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', marginBottom:28 }}>
          <div>
            <div style={{ color:'white', fontSize:16, fontWeight:800, marginBottom:4 }}>
              想知道这些城市是否真的适合你？
            </div>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, margin:0 }}>
              排行榜看的是市场全局。输入你的收入、家庭和住房预算，生成你的个人城市适配结果。
            </p>
          </div>
          <a href={`/calculate?occupation=${occ}`}
            style={{ padding:'13px 22px', borderRadius:12, background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color:'white', fontSize:14, fontWeight:700, textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
            生成我的个人适配结果 →
          </a>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20 }}>
          <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, margin:0 }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontWeight:600 }}>数据来源：</span>
            StatCan · CMHC · Job Bank · CRA & 省级税务局 · CIHI · ECCC
          </p>
          <p style={{ color:'rgba(255,255,255,0.40)', fontSize:11, marginTop:6 }}>
            各项指标经 Lakive 模型标准化处理，不代表官方排名。结果仅供参考，不构成财务或移民建议。2026年Q1。
          </p>
        </div>
      </div>
    </main>
  )
}

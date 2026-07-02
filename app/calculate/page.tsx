'use client'
import { useState, useMemo, useEffect, useRef } from 'react'

// ── Property types ─────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id:'1br',       label:'1居室',   priceMult:0.70, rentMult:0.78, desc:'单身/情侣'  },
  { id:'2br',       label:'2居室',   priceMult:1.00, rentMult:1.00, desc:'小家庭公寓' },
  { id:'3br',       label:'3居室',   priceMult:1.38, rentMult:1.35, desc:'大家庭公寓' },
  { id:'townhouse', label:'联排别墅', priceMult:1.55, rentMult:1.45, desc:'镇屋/联排' },
  { id:'detached',  label:'独立屋',  priceMult:2.20, rentMult:1.70, desc:'独立庭院'  },
]

// ── City data ──────────────────────────────────────────────────────────────────
const CITIES: Record<string, {
  name:string; short:string; province:string
  basePrice:number; medianRent:number
  tai:number; eoi:number; hai:number; eqi:number; tci:number; psi:number; edi:number
  taiNote:string; effectiveTax:number
}> = {
  vancouver: { name:'温哥华',   short:'YVR', province:'BC', basePrice:1050000, medianRent:3300, tai:72, eoi:80, hai:88, eqi:90, tci:82, psi:72, edi:80, taiNote:'GST+PST ~12%', effectiveTax:0.28 },
  toronto:   { name:'多伦多',   short:'YYZ', province:'ON', basePrice:980000,  medianRent:2600, tai:68, eoi:92, hai:90, eqi:75, tci:78, psi:68, edi:82, taiNote:'HST 13%',      effectiveTax:0.30 },
  calgary:   { name:'卡尔加里', short:'YYC', province:'AB', basePrice:550000,  medianRent:1750, tai:90, eoi:65, hai:78, eqi:82, tci:48, psi:78, edi:72, taiNote:'仅GST 5%',     effectiveTax:0.22 },
  montreal:  { name:'蒙特利尔', short:'YUL', province:'QC', basePrice:580000,  medianRent:1900, tai:42, eoi:72, hai:75, eqi:78, tci:72, psi:70, edi:80, taiNote:'GST+QST ~15%', effectiveTax:0.33 },
  ottawa:    { name:'渥太华',   short:'YOW', province:'ON', basePrice:650000,  medianRent:2400, tai:68, eoi:75, hai:82, eqi:80, tci:55, psi:82, edi:85, taiNote:'HST 13%',      effectiveTax:0.29 },
}
const CITY_IDS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']

// ── Occupation groups ──────────────────────────────────────────────────────────
const OCC_GROUPS = [
  { label:'医疗',     occs:[
    { id:'nurse',        name:'注册护士',   income:85000  },
    { id:'doctor',       name:'家庭医生',   income:220000 },
    { id:'pharmacist',   name:'药剂师',     income:105000 },
  ]},
  { label:'科技',     occs:[
    { id:'software_eng', name:'软件工程师', income:105000 },
    { id:'data_analyst', name:'数据分析师', income:85000  },
    { id:'it_support',   name:'IT技术支持', income:62000  },
  ]},
  { label:'工程建筑', occs:[
    { id:'electrician',  name:'电工',       income:82000  },
    { id:'engineer',     name:'土木工程师', income:92000  },
    { id:'plumber',      name:'水管工',     income:78000  },
    { id:'carpenter',    name:'木工',       income:68000  },
  ]},
  { label:'教育',     occs:[
    { id:'teacher',      name:'中学教师',   income:75000  },
  ]},
  { label:'法律金融', occs:[
    { id:'accountant',   name:'会计师',     income:82000  },
    { id:'lawyer',       name:'律师',       income:130000 },
  ]},
  { label:'公共服务', occs:[
    { id:'police',       name:'警察',       income:82000  },
    { id:'firefighter',  name:'消防员',     income:85000  },
    { id:'social_worker',name:'社会工作者', income:58000  },
  ]},
  { label:'运输物流', occs:[
    { id:'truck_driver', name:'卡车司机',   income:75000  },
    { id:'mechanic',     name:'汽车技师',   income:68000  },
  ]},
  { label:'服务业',   occs:[
    { id:'chef',          name:'厨师',           income:52000  },
    { id:'retail',        name:'零售店员',       income:38000  },
  ]},
  { label:'其他身份', occs:[
    { id:'self_employed', name:'自雇 / 个体经营', income:65000  },
    { id:'freelancer',    name:'自由职业者',      income:52000  },
    { id:'unemployed',    name:'暂未就业',        income:0      },
    { id:'retired',       name:'退休 / 财富自由', income:42000  },
  ]},
]
const ALL_OCCS = OCC_GROUPS.flatMap(g => g.occs)

// ── Color helpers ──────────────────────────────────────────────────────────────
const sc = (s:number) => s>=80?'#14B8A6':s>=70?'#60A5FA':s>=55?'#F59E0B':s>=40?'#E86C2F':'#EF4444'
const hc = (y:number) => y<6?'#14B8A6':y<10?'#F59E0B':y<14?'#E86C2F':'#EF4444'
const rc = (r:number) => r<30?'#14B8A6':r<38?'#F59E0B':r<45?'#E86C2F':'#EF4444'
const dc = (v:number) => v>=80?'#14B8A6':v>=65?'#60A5FA':'#F59E0B'
const hl = (y:number) => y<6?'可负担':y<10?'可承受':y<14?'沉重':'严峻'
const rl = (r:number) => r<30?'健康':r<38?'偏高':r<45?'高压':'危险'

// ── Score computation ──────────────────────────────────────────────────────────
function computeScore(hpiYears:number, rpi:number, tai:number, eoi:number, hai:number, eqi:number, tci:number, psi:number): number {
  const hpiScore = hpiYears<6?92:hpiYears<8?82:hpiYears<10?70:hpiYears<12?58:hpiYears<16?45:30
  const rpiScore = rpi<25?90:rpi<30?82:rpi<35?72:rpi<40?60:rpi<45?48:35
  const housingScore = hpiScore * 0.55 + rpiScore * 0.45
  const cityScore    = eoi*0.22 + tai*0.20 + hai*0.20 + eqi*0.14 + tci*0.12 + psi*0.12
  return Math.max(10, Math.min(99, Math.round(housingScore * 0.52 + cityScore * 0.48)))
}

// 5.5% 利率、25年摊销、月供系数
const MORTGAGE_FACTOR = 0.006145

// ── 租房判断 ───────────────────────────────────────────────────────────────────
function getRentVerdict(cityName:string, rpi:number, disposable:number, score:number) {
  if (rpi < 28)
    return { text:`租金仅占月收入 ${rpi}%，现金流非常健康，每月可支配空间充裕。`, tag:'轻松', color:'#14B8A6' }
  if (rpi < 35 && score >= 70)
    return { text:`租金压力处于合理范围（${rpi}%），在${cityName}租房是可行的长期选择。`, tag:'适配', color:'#14B8A6' }
  if (rpi < 40)
    return { text:`租金占月收入 ${rpi}%，每月可支配约 $${disposable.toLocaleString()}，储蓄空间有限但可管理。`, tag:'一般', color:'#F59E0B' }
  if (rpi < 50)
    return { text:`租金占月收入 ${rpi}%，超出健康水位——储蓄压力较大，需严格控制其他支出。`, tag:'有压力', color:'#E86C2F' }
  return { text:`租金将吞掉月收入的 ${rpi}%，在${cityName}以当前收入租住该房型财务压力极大。`, tag:'高压', color:'#EF4444' }
}

// ── 买房判断 ───────────────────────────────────────────────────────────────────
function getBuyVerdict(cityName:string, hpiYears:number, monthlyMortgage:number, monthlyNet:number, downYears:number) {
  const mortgageRatio = Math.round(monthlyMortgage / monthlyNet * 100)
  if (hpiYears < 6 && mortgageRatio < 35)
    return { text:`${cityName}买房门槛相对较低（${hpiYears}年收入），月供占税后收入 ${mortgageRatio}%，是可行的购房城市。`, tag:'可行', color:'#14B8A6' }
  if (hpiYears < 10 && mortgageRatio < 45)
    return { text:`买房需要 ${hpiYears}年收入，月供约占税后 ${mortgageRatio}%，压力可承受，但需要良好的财务规划。`, tag:'可承受', color:'#14B8A6' }
  if (hpiYears < 14 && mortgageRatio < 55)
    return { text:`买房需要 ${hpiYears}年收入，月供高达税后收入的 ${mortgageRatio}%，通常需要双收入才能可行。`, tag:'有压力', color:'#F59E0B' }
  if (hpiYears >= 14)
    return { text:`在${cityName}购买该房型需要 ${hpiYears}年收入，首付积累周期约 ${downYears}年，是极重的住房负担。`, tag:'高压', color:'#E86C2F' }
  return { text:`月供将占税后收入的 ${mortgageRatio}%，财务压力过重，建议考虑其他城市或更小的房型。`, tag:'高压', color:'#EF4444' }
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function CalculatePage() {
  const [cityId,    setCityId   ] = useState('vancouver')
  const [occId,     setOccId    ] = useState('')
  const [income,    setIncome   ] = useState<number>(0)
  const [propType,  setPropType ] = useState('2br')
  const [intent,    setIntent   ] = useState<'rent'|'buy'>('rent')
  const [showOccDrop, setShowOccDrop] = useState(false)
  const [submitted,   setSubmitted  ] = useState(false)
  const [showDetail,  setShowDetail ] = useState(false)
  const [copied,      setCopied     ] = useState(false)
  const [step,        setStep       ] = useState(1)   // 1=职业/收入 2=住房意向 3=城市 4=结果
  const resultsRef = useRef<HTMLDivElement>(null)

  // Read URL params — jump to results if all params present
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const c = p.get('city'), o = p.get('occupation'), h = p.get('housing')
    if (c && CITIES[c]) setCityId(c)
    if (o && ALL_OCCS.find(x => x.id === o)) {
      setOccId(o)
      const def = ALL_OCCS.find(x => x.id === o)?.income
      if (def) setIncome(def)
    }
    if (h && PROP_TYPES.find(x => x.id === h)) setPropType(h)
    if (c && o && h) { setSubmitted(true); setStep(4) }
  }, [])

  const handleOccChange = (id: string) => {
    setOccId(id)
    const def = ALL_OCCS.find(o => o.id === id)?.income
    if (def) setIncome(def)
    setShowOccDrop(false)
  }

  const goNext = () => {
    if (step < 3) { setStep(s => s + 1); return }
    // step 3 → 4: submit
    setSubmitted(true)
    setShowDetail(false)
    setStep(4)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
  }

  const goBack = () => {
    if (step === 4) { setStep(3); setSubmitted(false); return }
    setStep(s => Math.max(1, s - 1))
  }

  const city = CITIES[cityId]
  const occ  = ALL_OCCS.find(o => o.id === occId)
  const pt   = PROP_TYPES.find(p => p.id === propType) ?? PROP_TYPES[1]

  // ── Computed results ──────────────────────────────────────────────────────────
  const results = useMemo(() => {
    if (!submitted || income === 0) return null
    const adjPrice       = city.basePrice  * pt.priceMult
    const adjRent        = city.medianRent * pt.rentMult
    const hpiYears       = parseFloat((adjPrice / income).toFixed(1))
    const rpi            = Math.round((adjRent * 12 / income) * 100)
    const monthlyGross   = Math.round(income / 12)
    const monthlyNet     = Math.round(monthlyGross * (1 - city.effectiveTax))

    // Rent metrics
    const monthlyRentDisp = Math.max(0, monthlyNet - Math.round(adjRent))

    // Buy metrics
    const monthlyMortgage = Math.round(adjPrice * 0.80 * MORTGAGE_FACTOR)
    const monthlyBuyDisp  = monthlyNet - monthlyMortgage   // can go negative
    const downPayment     = adjPrice * 0.20
    const downYears       = parseFloat((downPayment / (income * 0.30)).toFixed(1)) // assume 30% savings rate

    const score   = computeScore(hpiYears, rpi, city.tai, city.eoi, city.hai, city.eqi, city.tci, city.psi)
    const verdict = intent === 'rent'
      ? getRentVerdict(city.name, rpi, monthlyRentDisp, score)
      : getBuyVerdict(city.name, hpiYears, monthlyMortgage, monthlyNet, downYears)

    // ── Cross-city comparison (same income, all 5 cities) ──────────────────────
    const allCities = CITY_IDS.map(id => {
      const c      = CITIES[id]
      const aPrice = c.basePrice  * pt.priceMult
      const aRent  = c.medianRent * pt.rentMult
      const hpi    = parseFloat((aPrice / income).toFixed(1))
      const r      = Math.round((aRent * 12 / income) * 100)
      const mGross = Math.round(income / 12)
      const mNet   = Math.round(mGross * (1 - c.effectiveTax))
      const mRentD = Math.max(0, mNet - Math.round(aRent))
      const mMtg   = Math.round(aPrice * 0.80 * MORTGAGE_FACTOR)
      const mBuyD  = mNet - mMtg
      const dYrs   = parseFloat((aPrice * 0.20 / (income * 0.30)).toFixed(1))
      const s      = computeScore(hpi, r, c.tai, c.eoi, c.hai, c.eqi, c.tci, c.psi)
      return { id, name:c.name, province:c.province, hpiYears:hpi, rpi:r, monthlyRent:Math.round(aRent), monthlyRentDisp:mRentD, monthlyMortgage:mMtg, monthlyBuyDisp:mBuyD, downYears:dYrs, score:s }
    }).sort((a, b) => b.score - a.score)

    const bestScore  = allCities[0].score
    const bestHpi    = Math.min(...allCities.map(c => c.hpiYears))
    const bestRentD  = Math.max(...allCities.map(c => c.monthlyRentDisp))
    const bestBuyD   = Math.max(...allCities.map(c => c.monthlyBuyDisp))
    const bestRpi    = Math.min(...allCities.map(c => c.rpi))

    return {
      adjPrice, adjRent, hpiYears, rpi,
      monthlyGross, monthlyNet,
      monthlyRentDisp, monthlyMortgage, monthlyBuyDisp, downYears,
      score, verdict,
      allCities, bestScore, bestHpi, bestRentD, bestBuyD, bestRpi,
    }
  }, [submitted, cityId, occId, income, propType, intent])

  const cityName = city.name
  const occName  = occ?.name ?? ''
  const isUnemployed = occId === 'unemployed'
  const noIncome = income === 0
  const step1Ready = !!occId && (isUnemployed ? true : income >= 10000)

  const STEP_LABELS = ['职业收入', '住房意向', '目标城市', '结果']

  return (
    <main style={{ minHeight:'100vh', background:'#0d1117' }}>
      <style>{`
        .drop-menu { position:absolute; top:calc(100% + 6px); left:0; right:0; background:#1a2035; border:1px solid rgba(255,255,255,0.12); border-radius:14px; overflow:hidden; z-index:80; }
        .drop-menu-inner { max-height:320px; overflow-y:auto; }
        .drop-menu-inner::-webkit-scrollbar { width:4px; }
        .drop-menu-inner::-webkit-scrollbar-track { background:transparent; }
        .drop-menu-inner::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.18); border-radius:2px; }
        .drop-item:hover { background:rgba(255,255,255,0.07); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
        .city-card:hover { border-color:rgba(79,142,247,0.40) !important; background:rgba(79,142,247,0.06) !important; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0d1117 0%,#131b2e 60%,#162035 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'36px 24px 40px' }}>
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <div style={{ color:'rgba(255,255,255,0.32)', fontSize:12, fontWeight:700, letterSpacing:'0.10em', marginBottom:12 }}>
            CALCULATE MY CITY FIT
          </div>
          <h1 style={{ color:'#FFFFFF', fontSize:28, fontWeight:900, lineHeight:1.2, margin:'0 0 10px' }}>
            你负担得起这座城市吗？
          </h1>
          <p style={{ color:'rgba(255,255,255,0.42)', fontSize:14, margin:'0 0 28px', lineHeight:1.6 }}>
            3步输入，即刻生成你的城市适配报告
          </p>

          {/* ── Step progress bar ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, maxWidth:380, margin:'0 auto' }}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const active  = n === step
              const done    = n < step
              return (
                <div key={n} style={{ display:'flex', alignItems:'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{
                      width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      background: done?'#14B8A6': active?'#4F8EF7':'rgba(255,255,255,0.08)',
                      border: `2px solid ${done?'#14B8A6':active?'#4F8EF7':'rgba(255,255,255,0.15)'}`,
                      color: done||active?'white':'rgba(255,255,255,0.35)',
                      fontSize:11, fontWeight:700,
                    }}>
                      {done ? '✓' : n}
                    </div>
                    <div style={{ color: active?'white':done?'#14B8A6':'rgba(255,255,255,0.28)', fontSize:9, fontWeight:700, whiteSpace:'nowrap' }}>
                      {label}
                    </div>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{ flex:1, height:2, background: done?'#14B8A6':'rgba(255,255,255,0.10)', margin:'0 6px', marginBottom:16 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── WIZARD STEPS ──────────────────────────────────────────────────────── */}
      {step < 4 && (
        <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 24px 60px' }}>

          {/* ── STEP 1: Occupation + Income ── */}
          {step === 1 && (
            <div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:20 }}>第 1 步：告诉我们你的职业和收入</div>

              {/* Occupation */}
              <div style={{ marginBottom:18 }}>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, marginBottom:8 }}>你的职业</div>
                <div style={{ position:'relative' }}>
                  <button onClick={() => setShowOccDrop(!showOccDrop)}
                    style={{ width:'100%', padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:`1px solid ${showOccDrop?'rgba(79,142,247,0.5)':'rgba(255,255,255,0.10)'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ color: occId ? 'white' : 'rgba(255,255,255,0.30)', fontSize:16, fontWeight:700 }}>
                      {occId ? occName : '选择你的职业'}
                    </span>
                    <span style={{ color:'rgba(255,255,255,0.28)', fontSize:12 }}>{showOccDrop ? '▴' : '▾'}</span>
                  </button>
                  {showOccDrop && (
                    <div className="drop-menu">
                      <div className="drop-menu-inner">
                        {OCC_GROUPS.map(g => (
                          <div key={g.label}>
                            <div style={{ padding:'10px 16px 5px', color:'rgba(255,255,255,0.28)', fontSize:10, fontWeight:700, letterSpacing:'0.07em' }}>{g.label}</div>
                            {g.occs.map(o => (
                              <button key={o.id} className="drop-item" onClick={() => handleOccChange(o.id)}
                                style={{ width:'100%', padding:'9px 16px', display:'flex', justifyContent:'space-between', cursor:'pointer', background:o.id===occId?'rgba(79,142,247,0.08)':'transparent', border:'none', textAlign:'left' }}>
                                <span style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:o.id===occId?700:400 }}>{o.name}</span>
                                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12, fontFamily:'monospace' }}>{o.income > 0 ? `$${(o.income/1000).toFixed(0)}K` : '—'}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Income */}
              <div style={{ marginBottom:28 }}>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, marginBottom:8 }}>
                  年收入（税前）<span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginLeft:8, fontWeight:400 }}>可按实际情况修改</span>
                </div>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', fontSize:16, fontWeight:600 }}>$</span>
                  <input
                    type="number"
                    value={income === 0 ? '' : income}
                    placeholder="例如 80000"
                    onChange={e => setIncome(Number(e.target.value))}
                    min={isUnemployed ? 0 : 10000} max={500000} step={1000}
                    style={{ width:'100%', padding:'14px 16px 14px 28px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'white', fontSize:18, fontWeight:700, fontFamily:'monospace', outline:'none', boxSizing:'border-box' }}
                  />
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.38)', fontSize:11 }}>CAD / 年</span>
                </div>
              </div>

              <button onClick={goNext} disabled={!step1Ready}
                style={{ width:'100%', padding:'16px', borderRadius:12, background: step1Ready ? 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' : 'rgba(255,255,255,0.07)', border:'none', cursor: step1Ready ? 'pointer' : 'not-allowed', color: step1Ready ? 'white' : 'rgba(255,255,255,0.25)', fontSize:16, fontWeight:800, transition:'all 0.2s' }}>
                {!occId ? '请先选择职业' : (!isUnemployed && income < 10000) ? '请填写年收入' : '下一步 → 住房意向'}
              </button>
            </div>
          )}

          {/* ── STEP 2: Intent + PropType ── */}
          {step === 2 && (
            <div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:20 }}>第 2 步：你打算租房还是买房？</div>

              {/* Rent vs Buy */}
              <div style={{ marginBottom:22 }}>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, marginBottom:10 }}>我的目标</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {([
                    { id:'rent', label:'租房', icon:'🏠', sub:'评估租金压力与月现金流' },
                    { id:'buy',  label:'买房', icon:'🔑', sub:'评估购房可行性与月供压力' },
                  ] as const).map(o => (
                    <button key={o.id} onClick={() => setIntent(o.id)}
                      style={{ padding:'18px 14px', borderRadius:14, cursor:'pointer', border:`2px solid ${intent===o.id?'#4F8EF7':'rgba(255,255,255,0.08)'}`, background:intent===o.id?'rgba(79,142,247,0.12)':'rgba(255,255,255,0.03)', transition:'all 0.15s', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{o.icon}</div>
                      <div style={{ color:intent===o.id?'white':'rgba(255,255,255,0.50)', fontSize:16, fontWeight:800, marginBottom:4 }}>{o.label}</div>
                      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>{o.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div style={{ marginBottom:28 }}>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, marginBottom:10 }}>住房类型</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:8 }}>
                  {PROP_TYPES.slice(0,3).map(p => (
                    <button key={p.id} onClick={() => setPropType(p.id)}
                      style={{ padding:'12px 6px', borderRadius:12, cursor:'pointer', border:`2px solid ${propType===p.id?'#4F8EF7':'rgba(255,255,255,0.08)'}`, background:propType===p.id?'rgba(79,142,247,0.12)':'rgba(255,255,255,0.03)', transition:'all 0.15s', textAlign:'center' }}>
                      <div style={{ color:propType===p.id?'white':'rgba(255,255,255,0.50)', fontSize:13, fontWeight:700 }}>{p.label}</div>
                      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, marginTop:2 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {PROP_TYPES.slice(3).map(p => (
                    <button key={p.id} onClick={() => setPropType(p.id)}
                      style={{ padding:'12px 6px', borderRadius:12, cursor:'pointer', border:`2px solid ${propType===p.id?'#4F8EF7':'rgba(255,255,255,0.08)'}`, background:propType===p.id?'rgba(79,142,247,0.12)':'rgba(255,255,255,0.03)', transition:'all 0.15s', textAlign:'center' }}>
                      <div style={{ color:propType===p.id?'white':'rgba(255,255,255,0.50)', fontSize:13, fontWeight:700 }}>{p.label}</div>
                      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, marginTop:2 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={goBack}
                  style={{ padding:'16px 20px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', cursor:'pointer', color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:700 }}>
                  ← 返回
                </button>
                <button onClick={goNext}
                  style={{ flex:1, padding:'16px', borderRadius:12, background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', border:'none', cursor:'pointer', color:'white', fontSize:16, fontWeight:800 }}>
                  下一步 → 选择城市
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: City selection ── */}
          {step === 3 && (
            <div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:20 }}>第 3 步：你想落脚在哪座城市？</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {CITY_IDS.map(id => {
                  const c = CITIES[id]
                  const sel = id === cityId
                  return (
                    <button key={id} className="city-card" onClick={() => setCityId(id)}
                      style={{ width:'100%', padding:'16px 20px', borderRadius:14, cursor:'pointer', border:`2px solid ${sel?'#4F8EF7':'rgba(255,255,255,0.08)'}`, background:sel?'rgba(79,142,247,0.10)':'rgba(255,255,255,0.025)', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'space-between', textAlign:'left' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:sel?'rgba(79,142,247,0.20)':'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:sel?'#60A5FA':'rgba(255,255,255,0.40)', fontFamily:'monospace' }}>
                          {c.short}
                        </div>
                        <div>
                          <div style={{ color:sel?'white':'rgba(255,255,255,0.75)', fontSize:16, fontWeight:800 }}>{c.name}</div>
                          <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:1 }}>{c.province} · {c.taiNote}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11, marginBottom:2 }}>基准房价</div>
                        <div style={{ color:sel?'#60A5FA':'rgba(255,255,255,0.50)', fontSize:14, fontWeight:700, fontFamily:'monospace' }}>
                          ${(c.basePrice/1000000).toFixed(2)}M
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={goBack}
                  style={{ padding:'16px 20px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', cursor:'pointer', color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:700 }}>
                  ← 返回
                </button>
                <button onClick={goNext}
                  style={{ flex:1, padding:'16px', borderRadius:12, background:'linear-gradient(135deg,#14B8A6,#0EA5E9)', border:'none', cursor:'pointer', color:'white', fontSize:16, fontWeight:800 }}>
                  计算我的城市适配度 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Back to wizard (step 4) ─────────────────────────────────────────── */}
      {step === 4 && (
        <div style={{ maxWidth:640, margin:'0 auto', padding:'16px 24px 0' }}>
          <button onClick={goBack}
            style={{ padding:'10px 16px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'rgba(255,255,255,0.50)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
            ← 修改条件
          </button>
        </div>
      )}

      {/* ── NO-INCOME PROMPT ─────────────────────────────────────────────────── */}
      {submitted && noIncome && (
        <div ref={resultsRef} style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px 60px' }}>
          <div style={{ textAlign:'center', padding:'48px 24px 40px' }}>
            <div style={{ fontSize:40, marginBottom:20 }}>💼</div>
            <div style={{ color:'white', fontSize:20, fontWeight:800, marginBottom:14 }}>收入未填写，无法生成分析</div>
            <p style={{ color:'rgba(255,255,255,0.48)', fontSize:14, lineHeight:1.85, maxWidth:400, margin:'0 auto 32px' }}>
              Lakive 的城市适配分、住房压力和城市推荐都基于你的实际收入计算。<br/>
              请填写年收入——可以是储蓄预算、伴侣收入或预期收入。
            </p>
            <button onClick={() => { setStep(1); setSubmitted(false) }}
              style={{ padding:'14px 32px', borderRadius:12, background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', border:'none', cursor:'pointer', color:'white', fontSize:15, fontWeight:700 }}>
              ← 返回填写收入
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      {results && (
        <div ref={resultsRef} style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px 60px' }}>

          {/* Verdict banner */}
          <div style={{ background:`${results.verdict.color}0D`, border:`1px solid ${results.verdict.color}30`, borderRadius:16, padding:'22px 24px', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ padding:'4px 10px', borderRadius:20, background:results.verdict.color+'22', border:`1px solid ${results.verdict.color}40` }}>
                <span style={{ color:results.verdict.color, fontSize:12, fontWeight:800 }}>{results.verdict.tag}</span>
              </div>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>{occName} · {cityName} · {pt.label}</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.82)', fontSize:15, lineHeight:1.65, margin:0, fontWeight:500 }}>
              {results.verdict.text}
            </p>
          </div>

          {/* 4 Core cards — split by intent */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {(intent === 'rent' ? [
              { label:'城市适配分',   value:String(results.score),                         color:sc(results.score),          sub:results.score>=80?'强适配':results.score>=65?'良好':results.score>=50?'有压力':'高压力' },
              { label:'租金占月收入', value:`${results.rpi}%`,                              color:rc(results.rpi),            sub:rl(results.rpi) },
              { label:'月均可支配',   value:`$${results.monthlyRentDisp.toLocaleString()}`, color:results.monthlyRentDisp>1200?'#14B8A6':results.monthlyRentDisp>600?'#F59E0B':'#EF4444', sub:`税后 $${results.monthlyNet.toLocaleString()} − 租金` },
              { label:'买房需要',     value:`${results.hpiYears}年收入`,                   color:hc(results.hpiYears),       sub:hl(results.hpiYears)+' · 仅供参考' },
            ] : [
              { label:'城市适配分',   value:String(results.score),                         color:sc(results.score),          sub:results.score>=80?'强适配':results.score>=65?'良好':results.score>=50?'有压力':'高压力' },
              { label:'买房需要',     value:`${results.hpiYears}年收入`,                   color:hc(results.hpiYears),       sub:hl(results.hpiYears) },
              { label:'月供估算',     value:`$${results.monthlyMortgage.toLocaleString()}`, color:results.monthlyBuyDisp>0?'#F59E0B':'#EF4444', sub:`5.5% · 25年 · 首付20%` },
              { label:'首付积累周期', value:`${results.downYears}年`,                      color:results.downYears<6?'#14B8A6':results.downYears<10?'#F59E0B':'#E86C2F', sub:'按30%储蓄率估算' },
            ]).map(card => (
              <div key={card.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px' }}>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginBottom:8 }}>{card.label}</div>
                <div style={{ color:card.color, fontSize:26, fontWeight:900, fontFamily:'monospace', lineHeight:1, marginBottom:6 }}>{card.value}</div>
                <div style={{ color:card.color, fontSize:11, opacity:0.75 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly breakdown — split by intent */}
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px 20px', marginBottom:20 }}>
            <div style={{ color:'rgba(255,255,255,0.50)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:12 }}>
              月度财务概览 · {pt.label} · {intent === 'rent' ? '租房情景' : '买房情景'}
            </div>
            {(intent === 'rent' ? [
              { label:'月薪（税前）',                                       value:`$${results.monthlyGross.toLocaleString()}`,          color:'rgba(255,255,255,0.65)' },
              { label:`预估税后（${Math.round(city.effectiveTax*100)}%）`, value:`$${results.monthlyNet.toLocaleString()}`,            color:'rgba(255,255,255,0.65)' },
              { label:`${pt.label}中位月租 · ${cityName}`,                 value:`−$${Math.round(results.adjRent).toLocaleString()}`,  color:'#E86C2F' },
              { label:'月均可支配（扣租后）',                               value:`$${results.monthlyRentDisp.toLocaleString()}`,       color:results.monthlyRentDisp>1200?'#14B8A6':results.monthlyRentDisp>600?'#F59E0B':'#EF4444', bold:true },
            ] : [
              { label:'月薪（税前）',                                       value:`$${results.monthlyGross.toLocaleString()}`,          color:'rgba(255,255,255,0.65)' },
              { label:`预估税后（${Math.round(city.effectiveTax*100)}%）`, value:`$${results.monthlyNet.toLocaleString()}`,            color:'rgba(255,255,255,0.65)' },
              { label:`月供估算（首付20% · 5.5% · 25年）`,                 value:`−$${results.monthlyMortgage.toLocaleString()}`,      color:'#E86C2F' },
              { label:'月均可支配（扣月供后）',                             value:`${results.monthlyBuyDisp>=0?'$'+results.monthlyBuyDisp.toLocaleString():'−$'+Math.abs(results.monthlyBuyDisp).toLocaleString()}`, color:results.monthlyBuyDisp>800?'#14B8A6':results.monthlyBuyDisp>0?'#F59E0B':'#EF4444', bold:true },
            ]).map((row, i, arr) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
                <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12 }}>{row.label}</span>
                <span style={{ color:row.color, fontSize:13, fontWeight:(row as any).bold?800:600, fontFamily:'monospace' }}>{row.value}</span>
              </div>
            ))}
            <p style={{ color:'rgba(255,255,255,0.42)', fontSize:11, margin:'10px 0 0' }}>
              税率为估算值（{city.taiNote}），月供基于5.5%利率、25年摊销、首付20%。不含保险、物业税等。
            </p>
          </div>

          {/* ── 城市推荐 ──────────────────────────────────────────────────────── */}
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'#FFFFFF', fontSize:17, fontWeight:800, marginBottom:12 }}>基于你的情况，哪个城市更适合？</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              {/* 推荐 */}
              <div style={{ background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.20)', borderRadius:14, padding:'14px 16px' }}>
                <div style={{ color:'#14B8A6', fontSize:11, fontWeight:800, letterSpacing:'0.07em', marginBottom:10 }}>✓ 推荐城市</div>
                {results.allCities.slice(0,2).map(c => (
                  <a key={c.id} href={`/city/${c.id}?occupation=${occId}&housing=${propType}`}
                    style={{ display:'block', marginBottom:8, textDecoration:'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'rgba(255,255,255,0.82)', fontSize:13, fontWeight:700 }}>{c.name}</span>
                      <span style={{ color:'#14B8A6', fontSize:13, fontWeight:800, fontFamily:'monospace' }}>{c.score}分</span>
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, marginTop:2 }}>
                      {intent==='rent'
                        ? `租金占比 ${c.rpi}% · 月可支配 $${c.monthlyRentDisp.toLocaleString()}`
                        : `买房 ${c.hpiYears}年收入 · 月供 $${c.monthlyMortgage.toLocaleString()}`}
                    </div>
                  </a>
                ))}
              </div>
              {/* 谨慎 */}
              <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:14, padding:'14px 16px' }}>
                <div style={{ color:'#EF4444', fontSize:11, fontWeight:800, letterSpacing:'0.07em', marginBottom:10 }}>⚠ 谨慎考虑</div>
                {results.allCities.slice(-2).map(c => (
                  <a key={c.id} href={`/city/${c.id}?occupation=${occId}&housing=${propType}`}
                    style={{ display:'block', marginBottom:8, textDecoration:'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'rgba(255,255,255,0.60)', fontSize:13, fontWeight:700 }}>{c.name}</span>
                      <span style={{ color:'#EF4444', fontSize:13, fontWeight:800, fontFamily:'monospace' }}>{c.score}分</span>
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>
                      {intent==='rent'
                        ? `租金占比 ${c.rpi}% · 月可支配 $${c.monthlyRentDisp.toLocaleString()}`
                        : `买房 ${c.hpiYears}年收入 · 月供 $${c.monthlyMortgage.toLocaleString()}`}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {/* Subscribe CTA */}
            <a href={`/subscribe?city=${results.allCities[0].id}${occId ? `&occ=${occId}` : ''}&pt=${propType}&from=calculate`}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,rgba(79,142,247,0.10),rgba(91,92,240,0.08))', border:'1px solid rgba(79,142,247,0.25)', borderRadius:14, padding:'14px 18px', textDecoration:'none' }}>
              <div>
                <div style={{ color:'#93C5FD', fontSize:13, fontWeight:700, marginBottom:2 }}>
                  📬 订阅 {results.allCities[0].name}{isUnemployed ? ' 就业机会月报' : occName ? ` × ${occName} 报告` : ' 城市月报'}
                </div>
                <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11 }}>
                  {isUnemployed ? 'EOI 就业指数动态 + 生活成本预警 · 免费 · 随时退订' : '月报 + 季报 · 免费 · 随时退订'}
                </div>
              </div>
              <span style={{ color:'#93C5FD', fontSize:16, marginLeft:12 }}>→</span>
            </a>
          </div>

          {/* ── 同样的我，换个城市会怎样？ ────────────────────────────────── */}
          <div style={{ marginBottom:20 }}>
            <div style={{ marginBottom:14 }}>
              <div style={{ color:'#FFFFFF', fontSize:17, fontWeight:800, marginBottom:4 }}>同样的收入，换个城市会怎样？</div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>以你的 ${income.toLocaleString()} 年收入为基准，在 5 个城市的生活压力对比</div>
            </div>

            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 52px 72px 80px', gap:6, padding:'8px 12px', marginBottom:4 }}>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, letterSpacing:'0.04em' }}>城市</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, textAlign:'center' }}>适配分</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, textAlign:'center' }}>{intent==='rent'?'租金占比':'买房需'}</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, textAlign:'right' }}>{intent==='rent'?'月可支配':'月供估算'}</span>
            </div>

            {results.allCities.map((c, i) => {
              const isCurrent = c.id === cityId
              const isBestSc  = c.score === results.bestScore
              const col3Best  = intent==='rent' ? c.rpi===results.bestRpi : c.hpiYears===results.bestHpi
              const col4Best  = intent==='rent' ? c.monthlyRentDisp===results.bestRentD : c.monthlyBuyDisp===results.bestBuyD
              const col3Value = intent==='rent'
                ? { val:`${c.rpi}%`,      color:rc(c.rpi),      badge:'最低' }
                : { val:`${c.hpiYears}年`, color:hc(c.hpiYears), badge:'最短' }
              const col4Value = intent==='rent'
                ? { val:`$${c.monthlyRentDisp.toLocaleString()}`, color:c.monthlyRentDisp>1200?'#14B8A6':c.monthlyRentDisp>600?'#F59E0B':'#EF4444', badge:'最高' }
                : { val:`$${c.monthlyMortgage.toLocaleString()}`, color:c.monthlyBuyDisp>0?'#F59E0B':'#EF4444', badge:'最低' }
              return (
                <a key={c.id}
                  href={`/city/${c.id}?occupation=${occId}&housing=${propType}`}
                  style={{ display:'grid', gridTemplateColumns:'1fr 52px 72px 80px', gap:6, padding:'12px 12px', borderRadius:12, marginBottom:6, textDecoration:'none', background:isCurrent?'rgba(79,142,247,0.08)':i===0&&!isCurrent?'rgba(20,184,166,0.05)':'rgba(255,255,255,0.025)', border:isCurrent?'1px solid rgba(79,142,247,0.30)':i===0&&!isCurrent?'1px solid rgba(20,184,166,0.18)':'1px solid rgba(255,255,255,0.06)', alignItems:'center' }}>
                  {/* City name */}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:3, height:28, borderRadius:2, background:isCurrent?'#4F8EF7':i===0&&!isCurrent?'#14B8A6':'rgba(255,255,255,0.10)', flexShrink:0 }} />
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ color:'white', fontSize:13, fontWeight:isCurrent||i===0?700:500 }}>{c.name}</span>
                        {isCurrent && <span style={{ fontSize:9, fontWeight:700, color:'#4F8EF7', background:'rgba(79,142,247,0.15)', padding:'1px 5px', borderRadius:4 }}>当前</span>}
                        {i===0 && !isCurrent && <span style={{ fontSize:9, fontWeight:700, color:'#14B8A6', background:'rgba(20,184,166,0.12)', padding:'1px 5px', borderRadius:4 }}>最优</span>}
                      </div>
                      <div style={{ color:'rgba(255,255,255,0.25)', fontSize:10 }}>{c.province}</div>
                    </div>
                  </div>
                  {/* Score */}
                  <div style={{ textAlign:'center' }}>
                    <span style={{ color:sc(c.score), fontSize:16, fontWeight:900, fontFamily:'monospace' }}>{c.score}</span>
                  </div>
                  {/* Col 3 */}
                  <div style={{ textAlign:'center' }}>
                    <div style={{ color:col3Value.color, fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{col3Value.val}</div>
                    {col3Best && <div style={{ color:'#14B8A6', fontSize:9, fontWeight:700 }}>{col3Value.badge}</div>}
                  </div>
                  {/* Col 4 */}
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:col4Value.color, fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{col4Value.val}</div>
                    {col4Best && <div style={{ color:'#14B8A6', fontSize:9, fontWeight:700 }}>{col4Value.badge}</div>}
                  </div>
                </a>
              )
            })}
            <p style={{ color:'rgba(255,255,255,0.38)', fontSize:11, margin:'8px 4px 0' }}>
              以你的 ${income.toLocaleString()} 年收入、{pt.label}需求计算，点击城市查看完整报告
            </p>
          </div>

          {/* Expand detail toggle */}
          <button onClick={() => setShowDetail(!showDetail)}
            style={{ width:'100%', padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'rgba(255,255,255,0.52)', fontSize:13, fontWeight:600, marginBottom: showDetail?0:20 }}>
            {showDetail ? '收起城市详细指数 ▲' : '查看 10 项城市指数 ▼'}
          </button>

          {/* Detail: 10 city dimensions */}
          {showDetail && (
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden', marginBottom:20 }}>
              <div style={{ padding:'14px 20px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color:'rgba(255,255,255,0.28)', fontSize:11, fontWeight:700, letterSpacing:'0.07em' }}>城市综合指数 · {cityName}</div>
              </div>
              {[
                { label:'住房压力 HPI', value:`${results.hpiYears}年收入`, color:hc(results.hpiYears), note:`${pt.label}参考价 $${Math.round(results.adjPrice).toLocaleString()}`, isPersonal:true },
                { label:'租金压力 RPI',  value:`${results.rpi}%`,           color:rc(results.rpi), note:`月租 $${Math.round(results.adjRent).toLocaleString()}`, isPersonal:true },
                { label:'税收指数 TAI',  value:String(city.tai),            color:dc(city.tai),    note:city.taiNote },
                { label:'就业机会 EOI',  value:String(city.eoi),            color:dc(city.eoi),    note:'城市整体就业密度' },
                { label:'医疗可及 HAI',  value:String(city.hai),            color:dc(city.hai),    note:'家庭医生可及性' },
                { label:'环境质量 EQI',  value:String(city.eqi),            color:dc(city.eqi),    note:'空气质量与绿地' },
                { label:'公共交通 TCI',  value:String(city.tci),            color:dc(city.tci),    note:'无车生活可行性' },
                { label:'公共安全 PSI',  value:String(city.psi),            color:dc(city.psi),    note:'社区安全评分' },
                { label:'教育资源 EDI',  value:String(city.edi),            color:dc(city.edi),    note:'高教与基础教育' },
              ].map((row, i) => (
                <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 20px', background:i%2===0?'rgba(255,255,255,0.018)':'transparent', borderBottom:i<8?'1px solid rgba(255,255,255,0.04)':'none' }}>
                  <div>
                    <span style={{ color:'rgba(255,255,255,0.55)', fontSize:13 }}>{row.label}</span>
                    {row.isPersonal && <span style={{ marginLeft:6, fontSize:10, color:'rgba(79,142,247,0.60)', fontWeight:700 }}>个人化</span>}
                    <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginTop:2 }}>{row.note}</div>
                  </div>
                  <span style={{ color:row.color, fontSize:14, fontWeight:800, fontFamily:'monospace' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            <a href={`/ranking?occupation=${occId}&housing=${propType}`}
              style={{ display:'block', background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.18)', borderRadius:14, padding:'16px 18px', textDecoration:'none' }}>
              <div style={{ color:'#14B8A6', fontSize:11, fontWeight:700, letterSpacing:'0.06em', marginBottom:5 }}>全国职业排行</div>
              <div style={{ color:'rgba(255,255,255,0.60)', fontSize:12, lineHeight:1.5 }}>哪个城市对{occName}整体最友好？</div>
            </a>
            <a href={`/compare?cities=${cityId},${results.allCities[0]?.id !== cityId ? results.allCities[0]?.id : results.allCities[1]?.id}&occupation=${occId}&housing=${propType}`}
              style={{ display:'block', background:'rgba(79,142,247,0.07)', border:'1px solid rgba(79,142,247,0.20)', borderRadius:14, padding:'16px 18px', textDecoration:'none' }}>
              <div style={{ color:'#60A5FA', fontSize:11, fontWeight:700, letterSpacing:'0.06em', marginBottom:5 }}>深度城市对比</div>
              <div style={{ color:'rgba(255,255,255,0.60)', fontSize:12, lineHeight:1.5 }}>{cityName} vs {results.allCities[0]?.id !== cityId ? results.allCities[0]?.name : results.allCities[1]?.name} 全维度拆解</div>
            </a>
          </div>

          {/* ── SHARE INSIGHT CARD ───────────────────────────────────────────── */}
          {(() => {
            const top = results.allCities[0]
            const shareLines = [
              `🏠 ${occName} 在加拿大买房需要多少年？`,
              ``,
              ...results.allCities.map(c => `${c.score >= 80 ? '🟢' : c.score >= 60 ? '🟡' : '🔴'} ${c.name}：${intent==='rent' ? `租金占 ${c.rpi}%` : `${c.hpiYears}年收入`} (${c.score}分)`),
              ``,
              `最优选择：${top.name} ${top.score}分`,
              `由 lakive.com 生成 | 职业×城市适配引擎`,
            ]
            const shareText = shareLines.join('\n')
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
            const redditUrl  = `https://reddit.com/submit?url=${encodeURIComponent('https://lakive.com/calculate')}&title=${encodeURIComponent(`${occName}在加拿大哪个城市最适合？Lakive数据`)}`
            const waUrl      = `https://wa.me/?text=${encodeURIComponent(shareText)}`
            return (
              <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px 20px' }}>
                <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:12 }}>分享这个洞察</div>
                {/* Preview card */}
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', marginBottom:14, fontFamily:'monospace' }}>
                  <div style={{ color:'rgba(255,255,255,0.75)', fontSize:12, lineHeight:1.8 }}>
                    🏠 <span style={{ fontWeight:700 }}>{occName}</span> × 加拿大城市适配<br/>
                    {results.allCities.map(c => (
                      <span key={c.id} style={{ display:'block' }}>
                        {c.score>=80?'🟢':c.score>=60?'🟡':'🔴'} {c.name}：{intent==='rent'?`租金 ${c.rpi}%`:`${c.hpiYears}年收入`} · {c.score}分
                      </span>
                    ))}
                    <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, display:'block', marginTop:4 }}>lakive.com</span>
                  </div>
                </div>
                {/* Share buttons */}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>

                  {/* Copy */}
                  <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                    title="复制文本"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:copied?'rgba(20,184,166,0.18)':'rgba(255,255,255,0.07)', border:`1px solid ${copied?'rgba(20,184,166,0.45)':'rgba(255,255,255,0.12)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                    {copied
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/></svg>
                    }
                  </button>

                  {/* X / Twitter */}
                  <a href={twitterUrl} target="_blank" rel="noopener" title="分享到 X / Twitter"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', textDecoration:'none' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>

                  {/* Facebook */}
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://lakive.com/calculate')}&quote=${encodeURIComponent(shareText)}`}
                    target="_blank" rel="noopener" title="分享到 Facebook"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(24,119,242,0.12)', border:'1px solid rgba(24,119,242,0.30)', textDecoration:'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                  </a>

                  {/* Instagram */}
                  <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.instagram.com/', '_blank') }}
                    title="复制内容并打开 Instagram"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(225,48,108,0.10)', border:'1px solid rgba(225,48,108,0.28)', cursor:'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="url(#ig)" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig)"/><defs><linearGradient id="ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#f09433"/><stop offset="0.25" stopColor="#e6683c"/><stop offset="0.5" stopColor="#dc2743"/><stop offset="0.75" stopColor="#cc2366"/><stop offset="1" stopColor="#bc1888"/></linearGradient></defs></svg>
                  </button>

                  {/* 小红书 */}
                  <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.xiaohongshu.com/', '_blank') }}
                    title="复制内容并打开小红书"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,45,45,0.10)', border:'1px solid rgba(255,45,45,0.28)', cursor:'pointer' }}>
                    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="10" fill="#FF2442"/>
                      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="sans-serif">书</text>
                    </svg>
                  </button>

                  {/* WhatsApp */}
                  <a href={waUrl} target="_blank" rel="noopener" title="分享到 WhatsApp"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', textDecoration:'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>

                  {/* Reddit */}
                  <a href={redditUrl} target="_blank" rel="noopener" title="分享到 Reddit"
                    style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,87,0,0.10)', border:'1px solid rgba(255,87,0,0.28)', textDecoration:'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  </a>
                </div>
                <div style={{ color:'rgba(255,255,255,0.22)', fontSize:11, marginTop:10 }}>
                  Instagram / 小红书：点击后自动复制内容，粘贴到发帖框即可
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </main>
  )
}

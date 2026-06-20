'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: '强'|'中'|'弱' }

// ── Score verdict ─────────────────────────────────────────────────────────────
function getVerdict(score: number, hpiYears?: number, rpi?: number) {
  const hasPressure = (hpiYears ?? 0) > 10 || (rpi ?? 0) > 38
  const note = (hpiYears ?? 0) > 10 ? '，住房压力高' : (rpi ?? 0) > 38 ? '，租金偏高' : ''
  if (score >= 85) return { label: '极度推荐', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)' }
  if (score >= 70 && hasPressure) return { label: `推荐${note}`, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)' }
  if (score >= 70) return { label: '推荐', color: '#14B8A6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)' }
  if (score >= 55) return { label: '中性', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' }
  if (score >= 40) return { label: '谨慎', color: '#E86C2F', bg: 'rgba(232,108,47,0.10)', border: 'rgba(232,108,47,0.25)' }
  return { label: '不推荐', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' }
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s: number) => s >= 80 ? '#14B8A6' : s >= 70 ? '#F59E0B' : s >= 55 ? '#F59E0B' : s >= 40 ? '#E86C2F' : '#EF4444'
const hc = (y: number) => y < 6 ? '#14B8A6' : y < 10 ? '#F59E0B' : y < 14 ? '#E86C2F' : '#EF4444'
const hl = (y: number) => y < 6 ? '可负担' : y < 10 ? '可承受' : y < 14 ? '沉重' : '严峻'
const rc = (r: number) => r < 30 ? '#14B8A6' : r < 38 ? '#F59E0B' : r < 45 ? '#E86C2F' : '#EF4444'
const rl = (r: number) => r < 30 ? '健康' : r < 38 ? '偏高' : r < 45 ? '高压' : '危险'
const dc = (v: number) => v >= 80 ? '#14B8A6' : v >= 65 ? '#60A5FA' : '#F59E0B'

// ── Dynamic headline ──────────────────────────────────────────────────────────
function getHeadline(cityName: string, occName: string, fit: OccFit) {
  if (fit.score >= 80) return `对${occName}来说，${cityName}是一个值得认真推进的选择。`
  if (fit.score >= 70 && fit.hpiYears > 10) return `对${occName}来说，${cityName}的问题不是有没有工作，而是收入能不能扛住房。`
  if (fit.score >= 70) return `对${occName}来说，${cityName}整体可以，但有几个关键压力点不能忽视。`
  if (fit.score >= 55) return `对${occName}来说，${cityName}机会与压力并存——不是一个容易的选择。`
  return `对${occName}来说，${cityName}的生存成本，可能远高于你的预期。`
}

// ── One-line summary ──────────────────────────────────────────────────────────
function getSummary(fit: OccFit, hpiYears: number, adjRpi: number): string {
  const job  = fit.eoi === '强' ? '机会较强' : fit.eoi === '中' ? '机会中等' : '机会偏弱'
  const rent = adjRpi > 38 ? '租金压力高' : adjRpi > 30 ? '租金偏高' : '租金压力合理'
  const buy  = hpiYears > 10 ? '单收入购房压力显著' : hpiYears > 6 ? '购房有一定压力' : '购房压力相对较低'
  return `${job}，${rent}，${buy}。`
}

// ── Occupation-aware City Reality ─────────────────────────────────────────────
function getOccReality(cityName: string, occName: string, fit: OccFit) {
  const highHpi = fit.hpiYears > 10, highRpi = fit.rpi > 38, goodJob = fit.eoi === '强'
  const bestFor = [
    goodJob ? `在${cityName}有稳定雇主或工会路径的${occName}` : `拥有稀缺技能、在${cityName}有明确职位的${occName}`,
    highHpi ? '双收入家庭，或已有首付储备与资产支持' : '计划近期购房并已储备首付的家庭',
    highRpi ? '愿意合租或选择外围区域以降低成本的人' : '希望独居并保持合理储蓄率的专业人士',
    `对${cityName}文化、自然环境或社区有强烈认同感的长期定居者`,
  ]
  const hardFor = [
    highHpi ? `依靠单人${occName}收入在${cityName}购房的家庭` : `预算有限、希望快速积累首付的${occName}`,
    highRpi ? `独居且追求高储蓄率的低中收入${occName}` : '入行早期收入偏低、独立负担生活成本的新人',
    `刚进入本地行业、尚未建立雇主与项目网络的人`,
    '希望 5 年内实现购房、储蓄与生活品质并存的单收入家庭',
  ]
  let hiddenRisk: string
  if (highHpi && highRpi) hiddenRisk = `${occName}在${cityName}的就业机会${goodJob ? '不弱' : '有限'}，但住房与租金双重压力会持续压缩可支配收入，长期资产积累速度可能显著落后于其他城市。`
  else if (highHpi) hiddenRisk = `核心风险是住房成本。${occName}在${cityName}的房价/年收入比约为 ${fit.hpiYears}×，在没有双收入或家庭资产支持的情况下，购房路径漫长。`
  else if (highRpi) hiddenRisk = `租金占收入 ${fit.rpi}%，超过健康上限（30%）。即使购房路径可行，过渡期的高租金也会拖慢首付积累速度。`
  else hiddenRisk = `当前数据相对乐观，但需注意房价与租金的长期涨幅，以及行业周期带来的收入波动，这些可能在未来改变现有优势。`
  return { bestFor, hardFor, hiddenRisk }
}

// ── Scenario-adjusted score (propType shifts pressure thresholds) ─────────────
function getAdjScore(base: OccFit, priceMult: number, rentMult: number): number {
  const adjH = base.hpiYears * priceMult
  const adjR = base.rpi * rentMult
  let delta = 0
  if (adjH > 10 && base.hpiYears <= 10) delta -= 5
  if (adjH > 14 && base.hpiYears <= 14) delta -= 5
  if (adjR > 38 && base.rpi <= 38)      delta -= 4
  if (adjR > 45 && base.rpi <= 45)      delta -= 4
  if (adjH < 6  && base.hpiYears >= 6)  delta += 5
  if (adjH < 10 && base.hpiYears >= 10) delta += 5
  if (adjR < 30 && base.rpi >= 30)      delta += 4
  if (adjR < 38 && base.rpi >= 38)      delta += 4
  return Math.max(10, Math.min(99, base.score + delta))
}

// ── Matrix tooltip ────────────────────────────────────────────────────────────
function getMatrixNote(occName: string, cityName: string, fit: OccFit) {
  const v   = getVerdict(fit.score, fit.hpiYears, fit.rpi)
  const job = fit.eoi === '强' ? '就业机会较强' : fit.eoi === '中' ? '就业机会尚可' : '就业机会偏弱'
  const h   = fit.hpiYears > 14 ? `房价/年收入 ${fit.hpiYears}×，购房难度极高` : fit.hpiYears > 9 ? `房价/年收入 ${fit.hpiYears}×，压力显著` : `房价/年收入 ${fit.hpiYears}×（相对可控）`
  return `${job}；${h}；租金占收入 ${fit.rpi}%（${rl(fit.rpi)}）。综合判断：${v.label}。`
}

// ── City base data ────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name: string; nameEn: string; province: string; short: string
  score: number; eoi: number; tai: number; hai: number; eqi: number; tci: number; psi: number; edi: number
  medianRent: number; basePrice: number; propertyTaxRate: number
  industries: string[]; winterC: number; summerC: number; sunnyDays: number; aqi: number; walkScore: number
  population: string; avgCommuteMin: number
  taiNote: string; taxSummary: string
  transferTax: (p: number) => number; transferTaxNote: string
}> = {
  vancouver: {
    name: '温哥华', nameEn: 'Vancouver', province: 'British Columbia', short: 'BC',
    score: 70, eoi: 80, tai: 72, hai: 88, eqi: 90, tci: 82, psi: 72, edi: 80,
    medianRent: 2950, basePrice: 1050000, propertyTaxRate: 0.00278,
    industries: ['科技 & 创业', '房地产 & 建筑', '电影 & 创意', '港口贸易'],
    winterC: 4, summerC: 22, sunnyDays: 164, aqi: 42, walkScore: 82,
    population: '280 万（都市圈）', avgCommuteMin: 30,
    taiNote: 'GST 5% + PST 7%（共 12%）',
    taxSummary: 'BC省：GST 5% + PST 7%，非HST省份',
    transferTax: p => { let t = 0; if (p <= 200000) t = p * 0.01; else if (p <= 2000000) t = 2000 + (p - 200000) * 0.02; else t = 38000 + (p - 2000000) * 0.03; return Math.round(t) },
    transferTaxNote: 'BC省 PTT：首 $200K 1%，$200K–$2M 2%，$2M以上3%',
  },
  toronto: {
    name: '多伦多', nameEn: 'Toronto', province: 'Ontario', short: 'ON',
    score: 70, eoi: 92, tai: 68, hai: 90, eqi: 75, tci: 78, psi: 68, edi: 82,
    medianRent: 2750, basePrice: 980000, propertyTaxRate: 0.00715,
    industries: ['金融 & 银行', '科技 & AI', '媒体 & 娱乐', '制造业'],
    winterC: -4, summerC: 26, sunnyDays: 201, aqi: 48, walkScore: 78,
    population: '670 万（都市圈）', avgCommuteMin: 34,
    taiNote: 'HST 13%（ON省 HST）',
    taxSummary: 'ON省：HST 13%，多伦多市额外征地产转让税',
    transferTax: p => { let t = 0; if (p <= 55000) t = p * 0.005; else if (p <= 250000) t = 275 + (p - 55000) * 0.01; else if (p <= 400000) t = 2225 + (p - 250000) * 0.015; else if (p <= 2000000) t = 4475 + (p - 400000) * 0.02; else t = 36475 + (p - 2000000) * 0.025; return Math.round(t * 2) },
    transferTaxNote: 'ON省 + 多伦多市双重地产转让税',
  },
  calgary: {
    name: '卡尔加里', nameEn: 'Calgary', province: 'Alberta', short: 'AB',
    score: 72, eoi: 65, tai: 90, hai: 78, eqi: 82, tci: 48, psi: 78, edi: 72,
    medianRent: 1950, basePrice: 550000, propertyTaxRate: 0.00657,
    industries: ['石油 & 天然气', '农业 & 食品', '科技 & 初创', '建筑 & 基建'],
    winterC: -9, summerC: 24, sunnyDays: 333, aqi: 32, walkScore: 48,
    population: '160 万（都市圈）', avgCommuteMin: 26,
    taiNote: '无 PST，仅 GST 5%',
    taxSummary: 'AB省：无省级销售税（PST），仅联邦 GST 5%，综合税负全国最低',
    transferTax: p => Math.round(50 + (p / 5000) * 2),
    transferTaxNote: 'AB省无地产转让税，仅土地登记费约 $200–300',
  },
  montreal: {
    name: '蒙特利尔', nameEn: 'Montréal', province: 'Québec', short: 'QC',
    score: 75, eoi: 72, tai: 42, hai: 75, eqi: 78, tci: 72, psi: 70, edi: 80,
    medianRent: 1850, basePrice: 580000, propertyTaxRate: 0.00531,
    industries: ['航空航天', '信息技术 & 游戏', '制药 & 生物科技', '金融 & 保险'],
    winterC: -10, summerC: 26, sunnyDays: 197, aqi: 39, walkScore: 72,
    population: '420 万（都市圈）', avgCommuteMin: 32,
    taiNote: 'GST 5% + QST 9.975%（共约 15%）',
    taxSummary: 'QC省：GST 5% + QST 9.975%，省级所得税全国最高，综合税负重',
    transferTax: p => { let t = 0; if (p <= 61500) t = p * 0.005; else if (p <= 307800) t = 307.5 + (p - 61500) * 0.01; else if (p <= 552300) t = 2765.5 + (p - 307800) * 0.015; else t = 6432.5 + (p - 552300) * 0.02; return Math.round(t) },
    transferTaxNote: 'Québec Welcome Tax（欢迎税）累进制',
  },
  ottawa: {
    name: '渥太华', nameEn: 'Ottawa', province: 'Ontario', short: 'ON',
    score: 73, eoi: 75, tai: 68, hai: 82, eqi: 80, tci: 55, psi: 82, edi: 85,
    medianRent: 2100, basePrice: 650000, propertyTaxRate: 0.01230,
    industries: ['政府 & 公共服务', '高科技 & 通信', '旅游 & 文化', '高等教育'],
    winterC: -10, summerC: 27, sunnyDays: 195, aqi: 35, walkScore: 55,
    population: '150 万（都市圈）', avgCommuteMin: 28,
    taiNote: 'HST 13%（ON省 HST）',
    taxSummary: 'ON省：HST 13%，渥太华仅征省级地产转让税，无市级附加',
    transferTax: p => { let t = 0; if (p <= 55000) t = p * 0.005; else if (p <= 250000) t = 275 + (p - 55000) * 0.01; else if (p <= 400000) t = 2225 + (p - 250000) * 0.015; else if (p <= 2000000) t = 4475 + (p - 400000) * 0.02; else t = 36475 + (p - 2000000) * 0.025; return Math.round(t) },
    transferTaxNote: 'ON省地产转让税（渥太华无市级附加，与多伦多不同）',
  },
}

// ── Fit matrix ────────────────────────────────────────────────────────────────
const FIT_MATRIX: Record<string, Record<string, OccFit>> = {
  vancouver: {
    electrician:  { score: 72, hpiYears: 13.0, rpi: 42, eoi: '强' },
    software_eng: { score: 84, hpiYears: 9.5,  rpi: 36, eoi: '强' },
    nurse:        { score: 68, hpiYears: 12.8, rpi: 43, eoi: '中' },
    teacher:      { score: 62, hpiYears: 14.0, rpi: 46, eoi: '中' },
    truck_driver: { score: 52, hpiYears: 16.5, rpi: 54, eoi: '中' },
    accountant:   { score: 65, hpiYears: 15.2, rpi: 49, eoi: '中' },
    police:       { score: 70, hpiYears: 12.5, rpi: 41, eoi: '强' },
    retail:       { score: 32, hpiYears: 26.0, rpi: 68, eoi: '中' },
  },
  toronto: {
    electrician:  { score: 70, hpiYears: 12.5, rpi: 40, eoi: '强' },
    software_eng: { score: 88, hpiYears: 9.2,  rpi: 34, eoi: '强' },
    nurse:        { score: 72, hpiYears: 12.0, rpi: 41, eoi: '强' },
    teacher:      { score: 65, hpiYears: 13.2, rpi: 44, eoi: '强' },
    truck_driver: { score: 55, hpiYears: 15.8, rpi: 52, eoi: '中' },
    accountant:   { score: 72, hpiYears: 13.8, rpi: 46, eoi: '强' },
    police:       { score: 68, hpiYears: 11.8, rpi: 40, eoi: '强' },
    retail:       { score: 30, hpiYears: 24.5, rpi: 65, eoi: '中' },
  },
  calgary: {
    electrician:  { score: 91, hpiYears: 3.9,  rpi: 24, eoi: '强' },
    software_eng: { score: 78, hpiYears: 5.2,  rpi: 28, eoi: '中' },
    nurse:        { score: 86, hpiYears: 4.5,  rpi: 25, eoi: '强' },
    teacher:      { score: 80, hpiYears: 5.8,  rpi: 28, eoi: '中' },
    truck_driver: { score: 82, hpiYears: 5.5,  rpi: 26, eoi: '强' },
    accountant:   { score: 78, hpiYears: 6.2,  rpi: 30, eoi: '中' },
    police:       { score: 84, hpiYears: 4.8,  rpi: 25, eoi: '强' },
    retail:       { score: 52, hpiYears: 13.2, rpi: 42, eoi: '中' },
  },
  montreal: {
    electrician:  { score: 68, hpiYears: 5.5,  rpi: 30, eoi: '中' },
    software_eng: { score: 70, hpiYears: 5.2,  rpi: 28, eoi: '中' },
    nurse:        { score: 65, hpiYears: 6.0,  rpi: 32, eoi: '中' },
    teacher:      { score: 68, hpiYears: 5.8,  rpi: 30, eoi: '中' },
    truck_driver: { score: 60, hpiYears: 7.2,  rpi: 36, eoi: '中' },
    accountant:   { score: 62, hpiYears: 6.8,  rpi: 34, eoi: '中' },
    police:       { score: 65, hpiYears: 6.5,  rpi: 32, eoi: '中' },
    retail:       { score: 45, hpiYears: 13.5, rpi: 44, eoi: '弱' },
  },
  ottawa: {
    electrician:  { score: 74, hpiYears: 6.8,  rpi: 28, eoi: '中' },
    software_eng: { score: 80, hpiYears: 6.2,  rpi: 26, eoi: '强' },
    nurse:        { score: 82, hpiYears: 6.5,  rpi: 27, eoi: '强' },
    teacher:      { score: 80, hpiYears: 7.0,  rpi: 28, eoi: '强' },
    truck_driver: { score: 65, hpiYears: 8.5,  rpi: 34, eoi: '中' },
    accountant:   { score: 74, hpiYears: 7.8,  rpi: 30, eoi: '中' },
    police:       { score: 80, hpiYears: 6.8,  rpi: 28, eoi: '强' },
    retail:       { score: 44, hpiYears: 16.0, rpi: 50, eoi: '弱' },
  },
}

const OCCUPATIONS = [
  { id: 'electrician',  name: '电工' },
  { id: 'software_eng', name: '软件工程师' },
  { id: 'nurse',        name: '注册护士' },
  { id: 'teacher',      name: '中学教师' },
  { id: 'truck_driver', name: '卡车司机' },
  { id: 'accountant',   name: '会计师' },
  { id: 'police',       name: '警察' },
  { id: 'retail',       name: '零售店员' },
]
const OCC_NAMES: Record<string, string> = Object.fromEntries(OCCUPATIONS.map(o => [o.id, o.name]))

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1居室',   priceMult: 0.70, rentMult: 0.78, dbKey: '1br_condo' },
  { id: '2br',       label: '2居室',   priceMult: 1.00, rentMult: 1.00, dbKey: '2br_condo' },
  { id: '3br',       label: '3居室',   priceMult: 1.38, rentMult: 1.35, dbKey: '3br_condo' },
  { id: 'townhouse', label: '联排别墅', priceMult: 1.55, rentMult: 1.45, dbKey: '3br_condo' },
  { id: 'detached',  label: '独立屋',  priceMult: 2.20, rentMult: 1.70, dbKey: '3br_condo' },
]

// ── Section header ────────────────────────────────────────────────────────────
function SecHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 3, height: 22, borderRadius: 2, background: '#4F8EF7', flexShrink: 0 }} />
      <div>
        <h2 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{title}</h2>
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 500 }}>{sub}</span>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const city     = CITY_BASE[slug] ?? CITY_BASE.vancouver
  const matrix   = FIT_MATRIX[slug] ?? FIT_MATRIX.vancouver

  const [occ,        setOcc      ] = useState('electrician')
  const [propType,   setPropType ] = useState('2br')
  const [hoveredOcc, setHovered  ] = useState<string | null>(null)
  const [liveHpi,    setLiveHpi  ] = useState<number | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setOcc(p.get('occupation') ?? 'electrician')
  }, [])

  useEffect(() => {
    const pt = PROP_TYPES.find(p => p.id === propType)!
    setLiveHpi(null)
    supabase.from('housing_years').select('years_current')
      .eq('city_id', slug).eq('occupation_id', occ).eq('property_type', pt.dbKey)
      .single()
      .then(({ data }) => {
        const base = (matrix[occ] ?? matrix.electrician).hpiYears
        setLiveHpi(data
          ? parseFloat(String(data.years_current))
          : parseFloat((base * pt.priceMult).toFixed(1))
        )
      })
  }, [slug, occ, propType])

  const pt       = PROP_TYPES.find(p => p.id === propType)!
  const fit      = matrix[occ] ?? matrix.electrician
  const hpiYears = liveHpi ?? parseFloat((fit.hpiYears * pt.priceMult).toFixed(1))
  const adjPrice = Math.round(city.basePrice * pt.priceMult)
  const adjRent  = Math.round(city.medianRent * pt.rentMult)
  const adjRpi   = Math.round(fit.rpi * pt.rentMult)
  const occName  = OCC_NAMES[occ] ?? occ
  const ocrData  = getOccReality(city.name, occName, { ...fit, hpiYears, rpi: adjRpi })
  const headline = getHeadline(city.name, occName, { ...fit, hpiYears, rpi: adjRpi })
  const summary  = getSummary(fit, hpiYears, adjRpi)

  const taxAmt  = city.transferTax(adjPrice)
  const propTax = Math.round(adjPrice * city.propertyTaxRate)

  // Matrix tiers — computed with propType multipliers so tiers shift when housing need changes
  const tieredOccs = OCCUPATIONS.map(o => {
    const base     = matrix[o.id] ?? matrix.electrician
    const adjScore = getAdjScore(base, pt.priceMult, pt.rentMult)
    const adjHpi   = parseFloat((base.hpiYears * pt.priceMult).toFixed(1))
    const adjRpiO  = Math.round(base.rpi * pt.rentMult)
    return { ...o, fit: base, adjScore, adjHpi, adjRpiO }
  })
  const strongFit  = tieredOccs.filter(o => o.adjScore >= 75)
  const pressureZ  = tieredOccs.filter(o => o.adjScore >= 55 && o.adjScore < 75)
  const highRisk   = tieredOccs.filter(o => o.adjScore < 55)

  // Rank across cities — adjusted for current propType so rank shifts when housing need changes
  const ALL_CITY_IDS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']
  const rankList     = ALL_CITY_IDS
    .filter(id => FIT_MATRIX[id]?.[occ])
    .map(id => ({ id, score: getAdjScore(FIT_MATRIX[id][occ], pt.priceMult, pt.rentMult) }))
    .sort((a, b) => b.score - a.score)
  const occRank     = rankList.findIndex(c => c.id === slug) + 1
  const totalCities = rankList.length
  const rankColor   = occRank === 1 ? '#14B8A6' : occRank === 2 ? '#60A5FA' : occRank === 3 ? '#F59E0B' : 'rgba(255,255,255,0.4)'

  // Adjusted score (for the hero big number)
  const adjScore   = getAdjScore(fit, pt.priceMult, pt.rentMult)
  const vMain      = getVerdict(adjScore, hpiYears, adjRpi)

  // Final verdict — propType-specific
  const altSlug    = slug === 'vancouver' || slug === 'toronto' ? 'calgary' : 'vancouver'
  const altCity    = CITY_BASE[altSlug].name
  const isHighCost = hpiYears > 10 || adjRpi > 38
  const verdictLine = (() => {
    const c = city.name, o = occName
    if (propType === '1br') {
      if (adjScore >= 80) return `${c}对${o}机会充足，1居室情景下住房压力（${adjRpi}% / ${hpiYears}年收入）相对可控，适合职业起步阶段。`
      if (adjRpi > 38)    return `${c}对${o}仍具备较强机会基础，但1居室月租占收入 ${adjRpi}%，会明显限制储蓄速度。`
      if (hpiYears > 10)  return `${c}对${o}在1居室情景下租金尚可，但房价/年收入 ${hpiYears}×，购房路径仍然偏长。`
      return `${c}对${o}在1居室情景下整体可行，机会与成本处于可接受的平衡点。`
    }
    if (propType === '3br') {
      if (hpiYears > 14)  return `对需要家庭空间的${o}，${c}住房成本会显著抬高长期定居与资产积累门槛（房价/年收入 ${hpiYears}年收入）。`
      if (hpiYears > 10)  return `3居室公寓情景下，${c}住房压力显著上升（${hpiYears}年收入），通常需要双收入或既有资产才能可行。`
      if (adjRpi > 38)    return `${c}对${o}家庭有空间，但3居室租金占收入 ${adjRpi}%，购房前的过渡期成本需要纳入规划。`
      return `${c}在3居室公寓情景下压力增加，但对有稳定双收入或资产支持的${o}家庭仍具备参考价值。`
    }
    if (propType === 'townhouse') {
      if (hpiYears > 16)  return `联排别墅在${c}的买房门槛极高（${hpiYears}年收入），即便是双收入${o}家庭也需要非常长的积累周期。`
      if (hpiYears > 11)  return `${c}的联排别墅压力明显（${hpiYears}年收入），是进入家庭住房阶段前需要认真评估的关键指标。`
      if (adjRpi > 40)    return `联排别墅月租占${o}收入 ${adjRpi}%，短期租住成本偏高，建议将买房窗口纳入 5–8 年规划。`
      return `${c}联排别墅情景下整体压力可承受，是有一定积累的${o}家庭可认真考虑的路径。`
    }
    if (propType === 'detached') {
      if (hpiYears > 18)  return `${c}的独立屋已超出大多数${o}的实际购买能力（${hpiYears}年收入），建议优先考虑其他城市或房型。`
      if (hpiYears > 12)  return `在${c}购入独立屋需要 ${hpiYears}年收入，通常需要强双收入、既有资产或长达 10 年以上的积累。`
      if (adjRpi > 40)    return `独立屋月租高企（占收入 ${adjRpi}%），对${o}而言租住独立屋的成本效益较低，建议以买为目标规划。`
      return `${c}的独立屋在当前情景下尚在可探索范围，适合有中长期定居计划且财务基础较稳的${o}。`
    }
    // 2BR default
    if (adjScore >= 80) return `${c}适合已有职业基础的${o}，2居室情景下综合适配度优秀。`
    if (adjScore >= 70 && isHighCost) return `${c}适合职业稳定、具备双收入或已有资产支持的${o}。`
    if (adjScore >= 70) return `${c}对${o}整体偏正向，有可操作路径，但需提前规划压力点。`
    if (adjScore >= 55) return `${c}对${o}不是容易的选择——机会与压力并存，建议充分对比后再决定。`
    return `从生活成本角度，${c}对${o}不是最优选择，系统性压力超过大多数人的可接受范围。`
  })()

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117' }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
        .score-sidebar { position: sticky; top: 24px; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .score-sidebar { position: relative !important; top: auto !important; }
        }
        .occ-btn { transition: all 0.15s; }
        .occ-btn:hover { opacity: 0.85; }
        .matrix-row:hover { background: rgba(79,142,247,0.06) !important; }
        .occ-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 600px) { .occ-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; } }
      `}</style>

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg,#0d1117 0%,#151827 70%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 48px' }}>
          <a href="/ranking" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, display: 'inline-block', marginBottom: 28, textDecoration: 'none' }}>← 返回排行榜</a>

          <div className="hero-grid">
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', gap: 6, marginBottom: 18 }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#93C5FD', fontSize: 11, fontWeight: 600 }}>{city.province}</span>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{city.nameEn}</span>
              </div>

              <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, lineHeight: 1.3, marginBottom: 28, letterSpacing: '-0.3px', maxWidth: 520 }}>
                {headline}
              </h1>

              {/* Occupation selector — names only, no scores */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>选择职业</div>
                <div className="occ-tabs">
                  {OCCUPATIONS.map(o => {
                    const sel = occ === o.id
                    return (
                      <button key={o.id} className="occ-btn" onClick={() => setOcc(o.id)}
                        style={{
                          padding: '7px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                          fontWeight: sel ? 700 : 500, border: 'none', outline: 'none', whiteSpace: 'nowrap',
                          background: sel ? 'linear-gradient(135deg,#14B8A6,#4F8EF7)' : 'rgba(255,255,255,0.06)',
                          color: sel ? 'white' : 'rgba(255,255,255,0.5)',
                          boxShadow: sel ? '0 2px 12px rgba(20,184,166,0.25)' : 'none',
                        }}>
                        {o.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: score sidebar */}
            <div className="score-sidebar">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: '24px 24px 20px', backdropFilter: 'blur(10px)' }}>

                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 12 }}>{occName} × {city.name}</div>

                {/* Property type toggle */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>住房需求假设</span>
                    <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 10 }}>影响租金、房价与住房压力</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
                    {PROP_TYPES.slice(0,3).map(p => (
                      <button key={p.id} onClick={() => { setPropType(p.id); setLiveHpi(null) }}
                        style={{ padding: '6px 0', borderRadius: 7, fontSize: 12, fontWeight: p.id === propType ? 700 : 500, cursor: 'pointer', border: 'none', background: p.id === propType ? 'rgba(255,255,255,0.10)' : 'transparent', color: p.id === propType ? 'white' : 'rgba(255,255,255,0.30)', transition: 'all 0.15s' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, marginTop: 3 }}>
                    {PROP_TYPES.slice(3).map(p => (
                      <button key={p.id} onClick={() => { setPropType(p.id); setLiveHpi(null) }}
                        style={{ padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: p.id === propType ? 700 : 500, cursor: 'pointer', border: `1px solid ${p.id === propType ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`, background: p.id === propType ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.02)', color: p.id === propType ? 'white' : 'rgba(255,255,255,0.30)', transition: 'all 0.15s' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>
                    当前情景：{pt.label} · {
                      propType === '1br' ? '单身/情侣' :
                      propType === '2br' ? '小家庭公寓' :
                      propType === '3br' ? '大家庭公寓' :
                      propType === 'townhouse' ? '联排别墅' : '独立屋'
                    }
                  </div>
                </div>

                {/* Big score */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: sc(adjScore), fontSize: 68, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-4px' }}>
                    {adjScore}
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>/100</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: vMain.bg, color: vMain.color, border: `1px solid ${vMain.border}` }}>
                      {vMain.label}
                    </span>
                    {occRank > 0 && (
                      <a href={`/ranking?occupation=${occ}&current=${slug}&housing=${propType}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: rankColor, textDecoration: 'none' }}>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>榜</span>#{occRank}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>/{totalCities}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 3 key metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: '就业机会',    value: fit.eoi,         sub: fit.eoi === '强' ? '岗位充足' : fit.eoi === '中' ? '一般' : '有限', color: fit.eoi === '强' ? '#14B8A6' : fit.eoi === '中' ? '#F59E0B' : '#EF4444' },
                    { label: '租金占月收入', value: `${adjRpi}%`,   sub: rl(adjRpi), color: rc(adjRpi) },
                    { label: '房价/年收入', value: `${hpiYears}年收入`,  sub: hl(hpiYears), color: hc(hpiYears) },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 9 }}>
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{m.label}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: m.color, fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{m.value}</span>
                        <span style={{ color: m.color, fontSize: 10, marginLeft: 5, opacity: 0.75 }}>{m.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* One-line summary */}
                <div style={{ padding: '10px 12px', background: `${vMain.color}0E`, border: `1px solid ${vMain.color}22`, borderRadius: 10 }}>
                  <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{summary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* ── 2. OCCUPATION FIT MATRIX ──────────────────────────────────── */}
        <section>
          <SecHeader title="职业适配矩阵" sub="同一座城市，不同职业的真实位置" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.8fr 0.7fr 0.6fr 1.2fr', gap: 8, padding: '6px 20px 10px', borderBottom: '1px solid rgba(255,255,255,0.10)', marginBottom: 4 }}>
            {['职业', `适配分·${pt.label}`, '房价/年收入', '租金压力', '就业', '结论'].map(h => (
              <span key={h} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tier: 'Strong Fit',                items: strongFit, color: '#14B8A6', bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.15)' },
              { tier: 'Recommended with Pressure', items: pressureZ, color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
              { tier: 'High Risk',                 items: highRisk,  color: '#EF4444', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.15)' },
            ].filter(t => t.items.length > 0).map(tier => (
              <div key={tier.tier} style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${tier.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tier.color }} />
                  <span style={{ color: tier.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>{tier.tier}</span>
                </div>
                {tier.items.map((o, i) => {
                  const v   = getVerdict(o.adjScore, o.adjHpi, o.adjRpiO)
                  const sel = occ === o.id
                  return (
                    <div key={o.id} className="matrix-row"
                      onClick={() => setOcc(o.id)}
                      onMouseEnter={() => setHovered(o.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.8fr 0.7fr 0.6fr 1.2fr', gap: 8, padding: '11px 20px', cursor: 'pointer', background: sel ? 'rgba(79,142,247,0.08)' : 'transparent', borderBottom: i < tier.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: sel ? '#FFFFFF' : 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: sel ? 700 : 400 }}>{o.name}</span>
                        {sel && <span style={{ fontSize: 8, color: '#93C5FD' }}>●</span>}
                      </div>
                      <div style={{ color: sc(o.adjScore), fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{o.adjScore}</div>
                      <div style={{ color: hc(o.adjHpi), fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>{o.adjHpi}×</div>
                      <div style={{ color: rc(o.adjRpiO), fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>{o.adjRpiO}%</div>
                      <div style={{ color: o.fit.eoi === '强' ? '#14B8A6' : o.fit.eoi === '中' ? '#F59E0B' : '#EF4444', fontSize: 13, fontWeight: 700 }}>{o.fit.eoi}</div>
                      <div>
                        {hoveredOcc === o.id
                          ? <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, lineHeight: 1.4 }}>{getMatrixNote(o.name, city.name, { ...o.fit, hpiYears: o.adjHpi, rpi: o.adjRpiO, score: o.adjScore })}</span>
                          : <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>{v.label.split('，')[0]}</span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. CITY SNAPSHOT ──────────────────────────────────────────── */}
        <section>
          <SecHeader title="城市基础事实" sub="地理、气候、通勤与产业特征" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { label: '都市圈人口', value: city.population },
              { label: '气候 · 冬/夏', value: `${city.winterC > 0 ? '+' : ''}${city.winterC}°C / +${city.summerC}°C` },
              { label: '年均晴天', value: `${city.sunnyDays} 天` },
              { label: '空气质量 AQI', value: String(city.aqi), note: city.aqi < 40 ? '优' : city.aqi < 60 ? '良' : '一般' },
              { label: '平均通勤', value: `${city.avgCommuteMin} 分钟` },
              { label: '步行友好', value: `${city.walkScore} / 100` },
              { label: '消费税', value: city.taiNote.split('（')[0].trim() },
              { label: '核心产业', value: city.industries.slice(0, 2).join(' · ') },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 5 }}>{item.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
                {'note' in item && item.note && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 2 }}>{item.note}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. CITY REALITY (compressed) ──────────────────────────────── */}
        <section>
          <SecHeader title={`${city.name}对${occName}的真实适配`} sub="基于职业视角动态生成" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* 更适合 */}
            <div style={{ background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.22)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>更适合</div>
              {ocrData.bestFor.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14B8A6', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
            {/* 压力较大 */}
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ color: '#EF4444', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>压力较大</div>
              {ocrData.hardFor.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Hidden risk — one sentence */}
          <div style={{ marginTop: 10, padding: '13px 16px', background: 'rgba(232,108,47,0.07)', border: '1px solid rgba(232,108,47,0.22)', borderRadius: 12, display: 'flex', gap: 10 }}>
            <span style={{ color: '#E86C2F', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>核心风险</span>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ocrData.hiddenRisk}</p>
          </div>
        </section>

        {/* ── 5. HOUSING REALITY (merged rent + buy) ────────────────────── */}
        <section>
          <SecHeader title="住房现实" sub="租得起，不等于买得起" />
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '14px 22px', borderRight: '1px solid rgba(255,255,255,0.06)', background: rc(adjRpi) + '0A' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>租房 · {pt.label}</span>
                <span style={{ color: rc(adjRpi), fontWeight: 800, fontSize: 14, marginLeft: 10 }}>{rl(adjRpi)}</span>
              </div>
              <div style={{ padding: '14px 22px', background: hc(hpiYears) + '0A' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>买房 · {pt.label}</span>
                <span style={{ color: hc(hpiYears), fontWeight: 800, fontSize: 14, marginLeft: 10 }}>{hl(hpiYears)}</span>
              </div>
            </div>

            {/* Data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* Rent panel */}
              <div style={{ padding: '20px 22px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                  {[
                    { label: '1居室', rent: Math.round(city.medianRent * 0.78), active: propType === '1br' },
                    { label: '2居室', rent: city.medianRent,                    active: propType === '2br' },
                    { label: '3居室', rent: Math.round(city.medianRent * 1.35), active: propType === '3br' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: r.active ? 'rgba(79,142,247,0.10)' : 'rgba(255,255,255,0.025)', border: r.active ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent', borderRadius: 9 }}>
                      <span style={{ color: r.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', fontSize: 12 }}>{r.label}中位租金</span>
                      <span style={{ color: r.active ? 'white' : 'rgba(255,255,255,0.55)', fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>${r.rent.toLocaleString()}/月</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', background: rc(adjRpi) + '0F', border: `1px solid ${rc(adjRpi)}22`, borderRadius: 10 }}>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginBottom: 3 }}>{occName}月收入占比</div>
                  <div style={{ color: rc(adjRpi), fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>{adjRpi}%</div>
                  {/* Pressure bar */}
                  <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                    {[{max:30,c:'#14B8A6'},{max:38,c:'#F59E0B'},{max:45,c:'#E86C2F'},{max:60,c:'#EF4444'}].map((z,i) => {
                      const prev = [0,30,38,45][i]
                      return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: adjRpi > prev ? z.c : 'rgba(255,255,255,0.07)', opacity: adjRpi > z.max ? 0.3 : 1 }} />
                    })}
                  </div>
                </div>
              </div>

              {/* Buy panel */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: `${pt.label}参考价`, value: `$${adjPrice.toLocaleString()}`, color: 'rgba(255,255,255,0.75)' },
                    { label: `预计 PTT`, value: `$${taxAmt.toLocaleString()}`, color: 'rgba(255,255,255,0.50)', note: '不含首次购房者豁免及其他可能适用税项' },
                    { label: '年物业税（估算）', value: `$${propTax.toLocaleString()}`, color: 'rgba(255,255,255,0.50)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 9 }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12 }}>{r.label}</div>
                        {'note' in r && r.note && <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, marginTop: 2 }}>{r.note}</div>}
                      </div>
                      <span style={{ color: r.color, fontWeight: 800, fontSize: 14, fontFamily: 'monospace', flexShrink: 0 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', background: hc(hpiYears) + '0F', border: `1px solid ${hc(hpiYears)}22`, borderRadius: 10 }}>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginBottom: 3 }}>
                    房价 / {occName}年收入
                  </div>
                  <div style={{ color: hc(hpiYears), fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>{hpiYears}年收入</div>
                </div>
              </div>
            </div>

            {/* Ownership tiers */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: '单收入',   risk: hpiYears > 12 ? '高风险' : hpiYears > 8 ? '有压力' : '可考虑', color: hpiYears > 12 ? '#EF4444' : hpiYears > 8 ? '#E86C2F' : '#14B8A6', note: hpiYears > 12 ? '房价收入比偏高，单收入下首付与按揭承受能力都需要长期规划。' : '需严格控制生活开支，长期规划重要' },
                { label: '双收入',   risk: hpiYears > 14 ? '谨慎' : '可行', color: hpiYears > 14 ? '#F59E0B' : '#14B8A6', note: hpiYears > 14 ? '住房成本仍然偏高，需重视首付压力' : '双收入条件下可行，建议做好5–7年财务规划' },
                { label: '既有资产', risk: '可行性显著提高', color: '#14B8A6', note: '已有首付或资产支持，是在此城市购房的重要优势' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: t.color + '08', border: `1px solid ${t.color}18`, borderRadius: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, minWidth: 52 }}>{t.label}</span>
                  <span style={{ color: t.color, fontWeight: 700, fontSize: 13, minWidth: 72 }}>{t.risk}</span>
                  <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.5 }}>{t.note}</span>
                </div>
              ))}
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '4px 0 0', paddingLeft: 4 }}>{city.transferTaxNote}</p>
            </div>

            {/* Bottom summary */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                {adjRpi <= 38
                  ? `对${occName}来说，租${pt.label}尚在可接受范围（${adjRpi}%），`
                  : `对${occName}来说，租${pt.label}压力较高（${adjRpi}%），`
                }
                {hpiYears <= 6
                  ? `买房仅需 ${hpiYears}年收入，是可负担性较强的城市。`
                  : hpiYears <= 10
                  ? `买房需要 ${hpiYears}年收入，压力处于中等水平，有一定的财务规划窗口。`
                  : `买房需要 ${hpiYears}年收入，单收入购房通常需要更长的首付积累周期；双收入或既有资产会显著改变结果。`
                }
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. CITY BASELINE SCORES ───────────────────────────────────── */}
        <section>
          <SecHeader title="城市指数" sub="职业情景指标 + 城市固有指标" />

          {/* Group A: occupation + scenario sensitive */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
              职业情景指标 · 随职业与住房需求变化
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {/* EOI — occupation-specific from FIT_MATRIX */}
              <DimCard label="就业机会 EOI" val={city.eoi} color={city.eoi >= 75 ? '#14B8A6' : '#F59E0B'} note={`${occName}岗位密度与增长`} />
              <DimCard label="税后指数 TAI" val={city.tai} color={city.tai >= 80 ? '#14B8A6' : city.tai >= 60 ? '#F59E0B' : '#E86C2F'} note={city.taiNote.split('（')[0]} />
              <DimCard label="租金压力 RPI" val={adjRpi} unit="%" color={rc(adjRpi)} note={`${pt.label} · ${rl(adjRpi)}`} />
              <DimCard label="房价/年收入" val={hpiYears} unit="年收入" color={hc(hpiYears)} note={`${pt.label} · ${hl(hpiYears)}`} />
            </div>
          </div>

          {/* Group B: city-fixed */}
          <div>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
              城市固有指标 · 不随职业或房型变化
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {[
                { label: '医疗可及 HAI', val: city.hai, note: '候诊时间 + 覆盖率' },
                { label: '教育质量 EDI', val: city.edi, note: '公立学区 + 高校' },
                { label: '环境质量 EQI', val: city.eqi, note: '空气 + 绿地 + 水质' },
                { label: '公共交通 TCI', val: city.tci, note: 'Walk + 公交覆盖' },
                { label: '公共安全 PSI', val: city.psi, note: '综合犯罪率指数' },
              ].map(d => {
                const bc = d.val >= 85 ? '#60A5FA' : d.val >= 70 ? '#93C5FD' : d.val >= 55 ? '#F59E0B' : '#E86C2F'
                return <DimCard key={d.label} {...d} color={bc} />
              })}
            </div>
          </div>
        </section>

        {/* ── 7. FINAL VERDICT + CTAs ───────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${vMain.color}28`, borderRadius: 20, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: vMain.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>FINAL VERDICT</span>
            {occRank > 0 && (
              <span style={{ marginLeft: 4, color: rankColor, fontSize: 12, fontWeight: 700 }}>
                · 加拿大{occName} · {pt.label}榜 #{occRank}/{totalCities}
              </span>
            )}
          </div>

          <p style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.5, margin: 0 }}>{verdictLine}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, minWidth: 72, paddingTop: 1 }}>可以考虑</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>
                {isHighCost ? '有稳定雇主或工会路径、双收入支持，或已有首付储备。' : '有明确的职业目标和合理的财务规划。'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700, minWidth: 72, paddingTop: 1 }}>建议对比</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>
                {altCity}
                {slug !== 'ottawa' && slug !== altSlug ? '、渥太华' : ''}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
            <a href={`/compare?cities=${slug},${altSlug}&occupation=${occ}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2 }}>横向对比</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{city.name} vs {altCity} →</div>
            </a>
            <a href={`/calculate?city=${slug}&occupation=${occ}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginBottom: 2 }}>个人化计算</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 12 }}>计算我的家庭情况 →</div>
            </a>
            <a href={`/ranking?occupation=${occ}&current=${slug}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginBottom: 2 }}>完整榜单</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 12 }}>{occName}城市排行榜 →</div>
            </a>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, textAlign: 'center' }}>
          数据来源：CMHC · StatCan · CIHI · Environment Canada · Job Bank · CRA<br />
          房价/年收入为{pt.label}参考价格与税前职业年收入之比，数值越低住房负担越轻。<br />
          CityCity Life System™ v4.2 · 2026年Q1 · citycity.org
        </p>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function DimCard({ label, val, unit, color, note }: { label: string; val: number|string; unit?: string; color?: string; note?: string }) {
  const display = `${val}${unit ?? ''}`
  const numVal  = typeof val === 'number' ? val : null
  const c       = color ?? '#14B8A6'
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px' }}>
      <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginBottom: 8 }}>{label}</div>
      <div style={{ color: c, fontSize: 26, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, marginBottom: 8 }}>{display}</div>
      {numVal !== null && (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${numVal}%`, background: c, borderRadius: 2, opacity: 0.55 }} />
        </div>
      )}
      {note && <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11 }}>{note}</div>}
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════════════════════
// NAME MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════════

const CITY_EN: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}
const CITY_ZH: Record<string, string> = {
  vancouver: '温哥华', toronto: '多伦多', calgary: '卡尔加里',
  montreal: '蒙特利尔', ottawa: '渥太华',
}

const OCC_EN: Record<string, string> = {
  nurse: 'Registered Nurse', doctor: 'Family Physician', pharmacist: 'Pharmacist',
  data_analyst: 'Data Analyst', software_engineer: 'Software Engineer', it_support: 'IT Support',
  engineer: 'Civil Engineer', electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  teacher: 'Secondary Teacher', lawyer: 'Lawyer', accountant: 'Accountant', social_worker: 'Social Worker',
  mechanic: 'Auto Mechanic', chef: 'Chef', firefighter: 'Firefighter', police_officer: 'Police Officer',
  real_estate_agent: 'Real Estate Agent', financial_advisor: 'Financial Advisor', truck_driver: 'Truck Driver',
  construction_worker: 'Construction Worker', retail_worker: 'Retail Associate', warehouse_worker: 'Warehouse Worker',
  self_employed: 'Self-Employed', freelancer: 'Freelancer',
  unemployed: 'Resident', retired: 'Independent',
}
const OCC_ZH: Record<string, string> = {
  nurse: '注册护士', doctor: '家庭医生', pharmacist: '药剂师',
  data_analyst: '数据分析师', software_engineer: '软件工程师', it_support: 'IT支持',
  engineer: '土木工程师', electrician: '电工', plumber: '水管工', carpenter: '木工',
  teacher: '中学教师', lawyer: '律师', accountant: '会计师', social_worker: '社工',
  mechanic: '汽车技师', chef: '厨师', firefighter: '消防员', police_officer: '警察',
  real_estate_agent: '房产经纪', financial_advisor: '财务顾问', truck_driver: '卡车司机',
  construction_worker: '建筑工人', retail_worker: '零售从业者', warehouse_worker: '仓库工人',
  self_employed: '自雇/个体', freelancer: '自由职业者',
  unemployed: '居民', retired: '独立人士',
}

// Occupation ID mapping: subscribe IDs → Supabase housing_years occupation_id
const OCC_TO_DB: Record<string, string> = {
  software_engineer: 'software_eng',
  police_officer: 'police',
  retail_worker: 'retail',
  real_estate_agent: 'real_estate',
}
function toDbOcc(occ: string): string {
  return OCC_TO_DB[occ] ?? occ
}

// PropType mapping: subscribe → Supabase property_type
function toDbProp(propType: string): string {
  const map: Record<string, string> = {
    '1br': '1br_condo', '2br': '2br_condo', '3br': '3br_condo', house: 'house',
  }
  return map[propType] ?? '2br_condo'
}

// ═══════════════════════════════════════════════════════════════════════════════
// CITY STATIC DATA (updated each report cycle)
// ═══════════════════════════════════════════════════════════════════════════════

interface CityInfo {
  housePrice: string; houseDelta: string; houseUp: boolean
  rent2br: string; rentDelta: string; rentUp: boolean
  mortgageRate: string
  cityScore: number; scoreDelta: string
  province: string; provinceZH: string
  scores: { label: string; zh: string; val: number }[]
  newsEN: { tag: string; title: string; body: string }[]
  newsZH: { tag: string; title: string; body: string }[]
  insightEN: string; insightZH: string
  outlookEN: string; outlookZH: string
}

const CITY_INFO: Record<string, CityInfo> = {
  calgary: {
    housePrice: '$578,000', houseDelta: '↑0.6%', houseUp: true,
    rent2br: '$2,010', rentDelta: '↑1.4%', rentUp: true,
    mortgageRate: '4.79%',
    cityScore: 84, scoreDelta: '↑2 vs Q1',
    province: 'Alberta', provinceZH: '艾伯塔省',
    scores: [
      { label: 'Employment', zh: '就业机会', val: 90 },
      { label: 'Housing', zh: '住房可及', val: 82 },
      { label: 'Cost of Living', zh: '生活成本', val: 85 },
      { label: 'Education', zh: '教育资源', val: 82 },
      { label: 'Safety', zh: '治安安全', val: 88 },
      { label: 'Transit', zh: '交通便利', val: 80 },
    ],
    newsEN: [
      { tag: 'Policy', title: 'Alberta Housing Incentives', body: 'Province announces secondary suite grants, potentially adding thousands of rental units across Calgary neighborhoods.' },
      { tag: 'Employment', title: 'Energy & Construction Surge', body: 'TC Energy expansion drives 300+ industrial electrician hires. CTrain Green Line construction adds 150 rail electrical roles through Q4.' },
      { tag: 'Transit', title: 'Green Line Final Approval', body: 'CTrain Green Line receives federal approval. Peak construction phase begins Q3 2026; estimated completion 2029.' },
    ],
    newsZH: [
      { tag: '政策', title: '艾伯塔住房激励', body: '省政府宣布附属套房补贴，有望在卡尔加里各社区新增数千套出租单位。' },
      { tag: '就业', title: '能源与建筑双旺', body: 'TC Energy扩建带动300+工业电工招聘。CTrain绿线施工新增150个轨道电气岗位，持续至Q4。' },
      { tag: '交通', title: '绿线获联邦批准', body: 'CTrain绿线获联邦最终批准，Q3 2026开始密集施工阶段；预计2029年建成。' },
    ],
    insightEN: "Calgary's fundamentals remain the strongest in Canada for skilled tradespeople. Zero provincial income tax, housing costs well below Vancouver and Toronto, and a construction and energy sector at multi-year highs. Q3 2026 is the employment peak — the window to act is now.",
    insightZH: "卡尔加里对技术工人而言仍是全加拿大综合最强。零省级所得税、住房成本远低于温哥华和多伦多，建筑与能源行业处于多年高点。Q3 2026是就业旺季——行动的窗口就在当下。",
    outlookEN: "House prices forecast $595K–$610K (↑3%). Rent approaching $2,200. Electrician demand: Strong through 2027 (CTrain + energy contracts). Rate trajectory: 4.25–4.50% by year-end.",
    outlookZH: "房价预测$595K–$610K（↑3%）。租金趋近$2,200。电工需求：2027年前持续强劲（CTrain+能源合同）。利率轨迹：年底前降至4.25–4.50%。",
  },
  vancouver: {
    housePrice: '$1,195,000', houseDelta: '↑0.3%', houseUp: true,
    rent2br: '$2,850', rentDelta: '↑1.1%', rentUp: true,
    mortgageRate: '4.79%',
    cityScore: 71, scoreDelta: '→ steady',
    province: 'BC', provinceZH: '不列颠哥伦比亚省',
    scores: [
      { label: 'Employment', zh: '就业机会', val: 78 },
      { label: 'Housing', zh: '住房可及', val: 45 },
      { label: 'Cost of Living', zh: '生活成本', val: 55 },
      { label: 'Education', zh: '教育资源', val: 90 },
      { label: 'Safety', zh: '治安安全', val: 72 },
      { label: 'Transit', zh: '交通便利', val: 85 },
    ],
    newsEN: [
      { tag: 'Policy', title: 'BC Multiplex Zoning Live', body: 'New legislation takes effect province-wide: municipalities must allow 4-unit housing on most single-family lots.' },
      { tag: 'Employment', title: 'Tech Sector Steady', body: 'US firms expanding Vancouver satellite offices sustain demand for software engineers and data analysts through year-end.' },
      { tag: 'Transit', title: 'Surrey-Langley SkyTrain', body: 'Construction accelerating; three new stations expected operational by late 2027, opening new commuter corridors.' },
    ],
    newsZH: [
      { tag: '政策', title: 'BC多户型分区全省生效', body: '新立法全省生效：市政府须允许大多数独立屋地块建造4套住宅，改变供应格局。' },
      { tag: '就业', title: '科技行业需求稳定', body: '美国企业持续扩展温哥华卫星办公室，软件工程师和数据分析师需求维持至年底。' },
      { tag: '交通', title: '素里-兰利天车延伸线', body: '延伸段施工加速；预计2027年底三个新站投入运营，开辟新通勤走廊。' },
    ],
    insightEN: "Vancouver offers Canada's most vibrant employment ecosystem and unmatched lifestyle — at a serious price. Rent absorbs 44% of median professional income, and a 2BR condo requires 16+ years of savings for most occupations. The new multiplex zoning may ease supply over a 3–5 year horizon. Budget carefully near-term.",
    insightZH: "温哥华拥有全加拿大最活跃的就业生态——但代价不菲。租金吸收了大多数专业人士44%的收入，购买两居室公寓对大多数职业需要16年以上积蓄。新多户型分区可能在3-5年内缓解供应。短期内请谨慎规划预算。",
    outlookEN: "House prices forecast $1.22M–$1.25M. Rent pressure sustained above $2,900. Tech employment remains resilient. Multiplex zoning: supply impact visible by 2028–2029.",
    outlookZH: "房价预测$1.22M–$1.25M。租金持续高于$2,900。科技就业保持韧性。多户型分区：2028-2029年可见供应影响。",
  },
  toronto: {
    housePrice: '$1,052,000', houseDelta: '↑0.4%', houseUp: true,
    rent2br: '$2,590', rentDelta: '↑0.9%', rentUp: true,
    mortgageRate: '4.79%',
    cityScore: 73, scoreDelta: '↑1 vs Q1',
    province: 'ON', provinceZH: '安大略省',
    scores: [
      { label: 'Employment', zh: '就业机会', val: 88 },
      { label: 'Housing', zh: '住房可及', val: 48 },
      { label: 'Cost of Living', zh: '生活成本', val: 58 },
      { label: 'Education', zh: '教育资源', val: 88 },
      { label: 'Safety', zh: '治安安全', val: 70 },
      { label: 'Transit', zh: '交通便利', val: 82 },
    ],
    newsEN: [
      { tag: 'Policy', title: 'Ontario HST Rebate Expanded', body: 'Province raises new construction HST rebate threshold, incentivizing developers to restart stalled condo projects across the GTA.' },
      { tag: 'Employment', title: 'Healthcare Hiring Wave', body: 'OHIP funding increase drives recruitment across 12 GTA hospital networks: nurses, pharmacists, and allied health professionals.' },
      { tag: 'Transit', title: 'Eglinton LRT Launch Imminent', body: 'Extended testing concludes; partial Eglinton Crosstown service expected Q4 2026 after multi-year delays.' },
    ],
    newsZH: [
      { tag: '政策', title: '安省扩大HST退税', body: '省政府提高新建筑HST退税门槛，激励开发商重启大多伦多地区停滞的公寓项目。' },
      { tag: '就业', title: '医疗大规模招聘', body: 'OHIP资金增加推动大多伦多地区12个医院网络大规模招募护士、药剂师和医疗辅助人员。' },
      { tag: '交通', title: '埃灵顿城际线即将开通', body: '延长测试结束；多年延误后，预计2026年Q4开始部分埃灵顿城际服务。' },
    ],
    insightEN: "Toronto provides Canada's deepest job market — healthcare, finance, and tech especially — but housing is a serious constraint. For mid-to-senior professionals whose earnings outpace housing cost growth, the premium increasingly makes sense. The Eglinton LRT will reshape inner-suburb demand through 2027.",
    insightZH: "多伦多提供全加拿大最深厚的就业市场——尤其是医疗、金融和科技——但住房是严峻制约。对于收入增速超过住房成本涨幅的中高级专业人员，多伦多的溢价越来越合理。埃灵顿城际线将在2027年前重塑内城近郊的需求格局。",
    outlookEN: "House prices forecast $1.07M–$1.09M. Rent expected $2,650+. Healthcare and tech employment: stable-to-growing. Eglinton LRT adds transit premium to inner suburbs.",
    outlookZH: "房价预测$1.07M–$1.09M。租金预计$2,650+。医疗和科技就业：稳定至增长。埃灵顿城际线为内城近郊增加交通溢价。",
  },
  montreal: {
    housePrice: '$590,000', houseDelta: '↑0.5%', houseUp: true,
    rent2br: '$1,890', rentDelta: '↑2.1%', rentUp: true,
    mortgageRate: '4.79%',
    cityScore: 76, scoreDelta: '→ steady',
    province: 'QC', provinceZH: '魁北克省',
    scores: [
      { label: 'Employment', zh: '就业机会', val: 75 },
      { label: 'Housing', zh: '住房可及', val: 80 },
      { label: 'Cost of Living', zh: '生活成本', val: 82 },
      { label: 'Education', zh: '教育资源', val: 85 },
      { label: 'Safety', zh: '治安安全', val: 72 },
      { label: 'Transit', zh: '交通便利', val: 78 },
    ],
    newsEN: [
      { tag: 'Policy', title: 'QC Rent Registry Live', body: 'Provincial rent registry launches, improving tenant protections and giving renters unprecedented historical rent data transparency.' },
      { tag: 'Employment', title: 'AI Industry Momentum', body: 'Mila and affiliated companies add 400+ tech and research roles, cementing Montréal as North America\'s AI research capital.' },
      { tag: 'Transit', title: 'REM Phase 2 Approved', body: 'REM northern extension approved; new commuter corridors to Laval and North Shore expected by 2028.' },
    ],
    newsZH: [
      { tag: '政策', title: '魁省租金登记系统上线', body: '省级租金登记系统启动，完善租户保护并提供前所未有的历史租金数据透明度。' },
      { tag: '就业', title: 'AI行业持续发展', body: 'Mila及合作公司新增400+科技和研究职位，巩固蒙特利尔北美AI研究之都地位。' },
      { tag: '交通', title: 'REM第二期获批', body: 'REM北延线获批；2028年前将拉瓦尔和北岸纳入新通勤走廊。' },
    ],
    insightEN: "Montréal delivers Canada's best cost-of-living value for skilled professionals. The AI ecosystem attracts global tech talent, and bilingualism remains a meaningful career differentiator. Rent growth at 2.1% is accelerating — but still half of national averages. A genuinely underrated destination.",
    insightZH: "蒙特利尔为技术专业人员提供加拿大最佳性价比。AI生态吸引全球科技人才，双语能力仍是有意义的职业差异化优势。租金涨幅2.1%正在加速——但仍是全国平均的一半。一个真正被低估的目的地。",
    outlookEN: "House prices forecast $610K–$625K. Rent may approach $1,950 by year-end. AI employment: strong hiring across research and product roles. REM Phase 2 commuter impact from 2028.",
    outlookZH: "房价预测$610K–$625K。租金年底前可能接近$1,950。AI就业：研究和产品岗位招聘强劲。REM第二期通勤影响从2028年起显现。",
  },
  ottawa: {
    housePrice: '$680,000', houseDelta: '↑0.2%', houseUp: true,
    rent2br: '$2,120', rentDelta: '↑0.8%', rentUp: true,
    mortgageRate: '4.79%',
    cityScore: 78, scoreDelta: '→ steady',
    province: 'ON', provinceZH: '安大略省',
    scores: [
      { label: 'Employment', zh: '就业机会', val: 80 },
      { label: 'Housing', zh: '住房可及', val: 75 },
      { label: 'Cost of Living', zh: '生活成本', val: 78 },
      { label: 'Education', zh: '教育资源', val: 82 },
      { label: 'Safety', zh: '治安安全', val: 85 },
      { label: 'Transit', zh: '交通便利', val: 72 },
    ],
    newsEN: [
      { tag: 'Policy', title: 'Federal Land Release', body: 'New federal program unlocks surplus government land across the National Capital Region for affordable housing development.' },
      { tag: 'Employment', title: 'Public Sector Expansion', body: 'Federal departments adding bilingual professional roles in tech, policy, and healthcare; strong demand for mid-career specialists.' },
      { tag: 'Transit', title: 'LRT Stage 3 Design Begins', body: 'Stage 3 environmental assessment complete; design phase starts Q4 2026 for extensions to Barrhaven and Kanata.' },
    ],
    newsZH: [
      { tag: '政策', title: '联邦土地释放', body: '新联邦计划为首都地区可负担住房开发解锁剩余政府用地。' },
      { tag: '就业', title: '公共部门扩张', body: '联邦部门在科技、政策和医疗领域增设双语专业岗位；对中级专业人员需求强劲。' },
      { tag: '交通', title: 'LRT第三期设计启动', body: '第三期环境评估完成；Q4 2026开始延伸至巴尔哈文和卡纳塔的设计阶段。' },
    ],
    insightEN: "Ottawa is Canada's most stable employment market — anchored by recession-proof federal government roles. Housing costs have risen moderately but remain affordable relative to Toronto and Vancouver. For professionals prioritizing stability and work-life balance, Ottawa is an increasingly compelling choice.",
    insightZH: "渥太华是加拿大最稳定的就业市场——以不受经济衰退影响的联邦政府职位为支撑。住房成本温和上涨，但相对多伦多和温哥华仍属可负担。对优先考虑稳定性和工作生活平衡的专业人员，渥太华是越来越有吸引力的选择。",
    outlookEN: "House prices forecast $690K–$705K. Rent stable around $2,150–$2,200. Government employment: stable with bilingual tech roles growing. LRT Stage 3 commuter network expands post-2028.",
    outlookZH: "房价预测$690K–$705K。租金稳定在$2,150–$2,200附近。政府就业：双语科技职位增长稳定。LRT第三期通勤网络2028年后扩展。",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERIOD HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const QUARTER_MONTHS_EN = ['Oct–Dec','Jan–Mar','Apr–Jun','Jul–Sep']
const QUARTER_MONTHS_ZH = ['10月—12月','1月—3月','4月—6月','7月—9月']

interface Period {
  briefEN: string     // "June 2026"
  briefZH: string     // "2026年6月"
  quarterLabel: string  // "Q2 2026"
  quarterEN: string   // "Apr–Jun 2026"
  quarterZH: string   // "2026年4月—6月"
  isQuarterMonth: boolean
}

function computePeriod(now: Date): Period {
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  // Monthly brief = previous month
  const bm = m === 0 ? 11 : m - 1
  const by = m === 0 ? y - 1 : y
  const briefEN = `${MONTH_EN[bm]} ${by}`
  const briefZH = `${by}年${MONTH_ZH[bm]}`

  // Quarterly = previous quarter
  const cq = Math.floor(m / 3)         // current quarter index 0-3
  const pq = cq === 0 ? 3 : cq - 1    // previous quarter index 0-3
  const py = cq === 0 ? y - 1 : y     // previous quarter year
  const quarterLabel = `Q${pq + 1} ${py}`
  const quarterEN = `${QUARTER_MONTHS_EN[pq]} ${py}`
  const quarterZH = `${py}年${QUARTER_MONTHS_ZH[pq]}`

  // Quarter months: Jan=0, Apr=3, Jul=6, Oct=9
  const isQuarterMonth = [0, 3, 6, 9].includes(m)

  return { briefEN, briefZH, quarterLabel, quarterEN, quarterZH, isQuarterMonth }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL HTML GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

const LOGO_HTML = `<span style="font-size:18px;font-weight:300;letter-spacing:0.12em;color:white"><span style="color:#14B8A6">LA</span>KıVE</span>`

const scoreColor = (val: number) =>
  val >= 85 ? '#10B981' : val >= 70 ? '#4F8EF7' : val >= 55 ? '#F59E0B' : '#EF4444'

const tagColor = (tag: string) => {
  const t = tag.toLowerCase()
  if (t === 'policy' || t === '政策') return { bg: 'rgba(79,142,247,0.15)', text: '#4F8EF7' }
  if (t === 'employment' || t === '就业') return { bg: 'rgba(16,185,129,0.15)', text: '#10B981' }
  if (t === 'transit' || t === '交通') return { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' }
  if (t === 'risk' || t === '风险') return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' }
  return { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.5)' }
}

function newsItemHtml(item: { tag: string; title: string; body: string }) {
  const tc = tagColor(item.tag)
  return `
  <div style="margin-bottom:14px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
    <div style="display:inline-block;background:${tc.bg};color:${tc.text};font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em;">${item.tag}</div>
    <div style="color:white;font-size:13px;font-weight:700;margin-bottom:5px;">${item.title}</div>
    <div style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.7;">${item.body}</div>
  </div>`
}

function scoreBarHtml(label: string, zh: string, val: number, isZh: boolean) {
  const color = scoreColor(val)
  const pct = Math.round((val / 100) * 100)
  return `
  <tr>
    <td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:12px;width:110px;">${isZh ? zh : label}</td>
    <td style="padding:6px 0 6px 12px;">
      <div style="height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
      </div>
    </td>
    <td style="padding:6px 0 6px 10px;color:${color};font-size:12px;font-weight:700;font-family:monospace;width:36px;">${val}</td>
  </tr>`
}

function kpiCard(icon: string, label: string, value: string, delta: string, up: boolean) {
  const dc = up ? '#10B981' : '#EF4444'
  return `
  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
    <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:8px;">${icon} ${label}</div>
    <div style="color:white;font-size:20px;font-weight:800;font-family:monospace;letter-spacing:-0.5px;">${value}</div>
    <div style="color:${dc};font-size:11px;margin-top:4px;">${delta}</div>
  </div>`
}

// ── Monthly Brief ─────────────────────────────────────────────────────────────

interface MonthlyParams {
  city: string; occ: string; lang: 'en' | 'zh'
  hpiYears: number; rpi: number; period: Period
}

function monthlyBriefHtml({ city, occ, lang, hpiYears, rpi, period }: MonthlyParams): string {
  const zh = lang === 'zh'
  const info = CITY_INFO[city] ?? CITY_INFO.calgary
  const cityName = zh ? (CITY_ZH[city] ?? city) : (CITY_EN[city] ?? city)
  const occName  = zh ? (OCC_ZH[occ] ?? occ) : (OCC_EN[occ] ?? occ)
  const periodLabel = zh ? period.briefZH : period.briefEN

  const hpiStr = hpiYears > 0 ? `${hpiYears.toFixed(1)} yr` : '—'
  const rpiStr = rpi > 0 ? `${rpi.toFixed(1)}%` : '—'

  const news = zh ? info.newsZH : info.newsEN
  const insight = zh ? info.insightZH : info.insightEN

  const t = {
    reportType:   zh ? '月度城市简报' : 'Monthly City Brief',
    yourSnapshot: zh ? `你的住房快照 · ${occName}` : `Your Housing Snapshot · ${occName}`,
    hpiLabel:     zh ? '购房年限 hpiYears（2居室）' : 'Years to buy 2BR condo (hpiYears)',
    rpiLabel:     zh ? '租金收入比 rpi' : 'Rent-to-income ratio (rpi)',
    benchmark:    zh ? '对比：温哥华 16.2年/54% · 多伦多 15.1年/51%' : 'vs Vancouver 16.2 yr/54% · Toronto 15.1 yr/51%',
    thisMonth:    zh ? `本月${cityName}` : `This Month in ${cityName}`,
    insightTitle: zh ? `Lakive Insight · ${periodLabel}` : `Lakive Insight · ${periodLabel}`,
    timeline:     zh ? '决策时间线' : 'Decision Timeline',
    tl1:          zh ? '现在 — 数据评估' : 'Now — Data assessment',
    tl2:          zh ? '1–3个月 — 市场观察' : '1–3 mo — Market observation',
    tl3:          zh ? '3–6个月 — 落地准备' : '3–6 mo — Prepare to move',
    tl4:          zh ? '6–12个月 — 目标锁定' : '6–12 mo — Target lock-in',
    cta1:         zh ? '计算你的数字 →' : 'Calculate Your Numbers →',
    cta2:         zh ? '对比其他城市' : 'Compare Cities',
    footer1:      zh ? '免费订阅 · 无广告 · 随时退订' : 'Free · No ads · Unsubscribe anytime',
    footer2:      zh ? '数据来源：CREA · Statistics Canada · Rentals.ca · CMHC' : 'Data: CREA · Statistics Canada · Rentals.ca · CMHC',
    dataDate:     zh ? `数据截至${periodLabel}末` : `Data as of ${periodLabel}`,
    houseLabel:   zh ? '房价（2居室）' : 'House Price (2BR)',
    rentLabel:    zh ? '月租（2居室）' : 'Rent (2BR/mo)',
    scoreLabel:   zh ? '城市适配分' : 'City Fit Score',
    rateLabel:    zh ? '5年期固定房贷利率' : '5yr Fixed Mortgage',
    scoreDeltaNote: zh ? `${info.scoreDelta}` : `${info.scoreDelta}`,
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:16px;background:#111827;">
<div style="font-family:Arial,-apple-system,'PingFang SC',sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0d1117 0%,#1a2035 100%);padding:32px 28px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="margin-bottom:20px;">${LOGO_HTML}</div>
    <div style="color:rgba(255,255,255,0.38);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">${t.reportType} · ${periodLabel}</div>
    <div style="font-size:22px;font-weight:800;color:white;line-height:1.3;">${cityName} × ${occName}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:6px;">${info.province} · ${t.dataDate}</div>
  </div>

  <!-- 4 KPI cards (2×2 table) -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding:0 6px 10px 0;vertical-align:top;">
          ${kpiCard('🏠', t.houseLabel, info.housePrice, `${info.houseDelta} MoM`, info.houseUp)}
        </td>
        <td style="width:50%;padding:0 0 10px 6px;vertical-align:top;">
          ${kpiCard('🔑', t.rentLabel, info.rent2br, `${info.rentDelta} MoM`, info.rentUp)}
        </td>
      </tr>
      <tr>
        <td style="width:50%;padding:6px 6px 0 0;vertical-align:top;">
          ${kpiCard('⭐', t.scoreLabel, `${info.cityScore}/100`, t.scoreDeltaNote, true)}
        </td>
        <td style="width:50%;padding:6px 0 0 6px;vertical-align:top;">
          ${kpiCard('📊', t.rateLabel, info.mortgageRate, '↓ BOC easing', true)}
        </td>
      </tr>
    </table>
  </div>

  <!-- Housing Snapshot (personalized) -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${t.yourSnapshot}</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 12px 10px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
          <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:6px;">${t.hpiLabel}</div>
          <div style="color:white;font-size:20px;font-weight:800;font-family:monospace;">${hpiStr}</div>
        </td>
        <td style="padding:10px 0 10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
          <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:6px;">${t.rpiLabel}</div>
          <div style="color:white;font-size:20px;font-weight:800;font-family:monospace;">${rpiStr}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:10px 0 0;">
          <div style="color:rgba(255,255,255,0.3);font-size:11px;line-height:1.6;">${t.benchmark}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- City news -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${t.thisMonth}</div>
    ${news.map(newsItemHtml).join('')}
  </div>

  <!-- Lakive Insight -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">${t.insightTitle}</div>
    <div style="color:rgba(255,255,255,0.82);font-size:13px;line-height:1.85;border-left:3px solid #14B8A6;padding-left:16px;">${insight}</div>
  </div>

  <!-- Decision Timeline -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">${t.timeline}</div>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        { icon: '🔍', label: t.tl1, active: true },
        { icon: '📊', label: t.tl2, active: false },
        { icon: '📦', label: t.tl3, active: false },
        { icon: '🎯', label: t.tl4, active: false },
      ].map(tl => `
      <tr>
        <td style="padding:8px 0;width:28px;vertical-align:middle;">
          <div style="width:22px;height:22px;border-radius:50%;background:${tl.active ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.04)'};border:1.5px solid ${tl.active ? '#4F8EF7' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:11px;text-align:center;">${tl.icon}</div>
        </td>
        <td style="padding:8px 0 8px 10px;color:${tl.active ? 'white' : 'rgba(255,255,255,0.4)'};font-size:12px;font-weight:${tl.active ? '700' : '400'};">${tl.label}</td>
      </tr>`).join('')}
    </table>
  </div>

  <!-- CTA -->
  <div style="padding:24px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
    <a href="https://lakive.com/calculate?city=${city}&occ=${occ}" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#5B5CF0);color:white;font-size:13px;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;margin:0 6px 8px;">${t.cta1}</a>
    <a href="https://lakive.com/compare?city=${city}" style="display:inline-block;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;padding:13px 24px;border-radius:10px;text-decoration:none;margin:0 6px 8px;border:1px solid rgba(255,255,255,0.1);">${t.cta2}</a>
  </div>

  <!-- Footer -->
  <div style="padding:20px 28px;">
    <p style="color:rgba(255,255,255,0.22);font-size:11px;line-height:1.9;margin:0;">
      ${t.footer1}<br/>
      Lakive City Intelligence · <a href="https://lakive.com" style="color:rgba(255,255,255,0.35);text-decoration:none;">lakive.com</a><br/>
      ${t.footer2}
    </p>
  </div>

</div>
</body>
</html>`
}

// ── Quarterly Report ──────────────────────────────────────────────────────────

interface QuarterlyParams {
  city: string; occ: string; lang: 'en' | 'zh'
  hpiYears: number; rpi: number; period: Period
}

function quarterlyReportHtml({ city, occ, lang, hpiYears, rpi, period }: QuarterlyParams): string {
  const zh = lang === 'zh'
  const info = CITY_INFO[city] ?? CITY_INFO.calgary
  const cityName = zh ? (CITY_ZH[city] ?? city) : (CITY_EN[city] ?? city)
  const occName  = zh ? (OCC_ZH[occ] ?? occ) : (OCC_EN[occ] ?? occ)
  const qLabel   = period.quarterLabel
  const qPeriod  = zh ? period.quarterZH : period.quarterEN

  const hpiStr = hpiYears > 0 ? `${hpiYears.toFixed(1)} yr` : '8.5 yr'
  const rpiStr = rpi > 0 ? `${rpi.toFixed(1)}%` : `${rpi}%`

  const demandLabel = info.cityScore >= 82 ? (zh ? '强' : 'Strong') : info.cityScore >= 72 ? (zh ? '中等' : 'Moderate') : (zh ? '一般' : 'Fair')
  const news = zh ? info.newsZH : info.newsEN
  const insight = zh ? info.insightZH : info.insightEN
  const outlook = zh ? info.outlookZH : info.outlookEN

  const t = {
    reportType:    zh ? '季度城市智能报告' : 'Quarterly City Intelligence Report',
    coverMetrics:  zh ? '封面指标' : 'Quarter at a Glance',
    cityScore:     zh ? '城市综合适配分' : 'City Fit Score',
    hpiLabel:      zh ? '购房年限 hpiYears' : 'Years to Buy 2BR',
    rpiLabel:      zh ? '租金收入比 rpi' : 'Rent-to-Income',
    eoiLabel:      zh ? '就业机会指数 EOI' : 'Job Opportunity Index',
    execSummary:   zh ? '执行摘要' : 'Executive Summary',
    dimScores:     zh ? '六维适配评分' : 'Six Dimension Scores',
    housingTrends: zh ? '住房趋势' : 'Housing Trends',
    qhPrice:       zh ? `${qLabel}房价中位数` : `${qLabel} Median House Price`,
    qRent:         zh ? `${qLabel}2居室月租` : `${qLabel} 2BR Monthly Rent`,
    employment:    zh ? '就业 & 职业适配' : 'Employment & Occupation Fit',
    risks:         zh ? '风险因素' : 'Risk Factors',
    outlook6m:     zh ? '6–12个月展望' : '6–12 Month Outlook',
    verdict:       zh ? `Lakive Insight · ${qLabel} 季度结论` : `Lakive Quarterly Verdict · ${qLabel}`,
    cta1:          zh ? '计算你的个人数字 →' : 'Calculate Your Numbers →',
    cta2:          zh ? '与其他城市对比' : 'Compare Cities',
    footer1:       zh ? '免费订阅 · 无广告 · 随时退订' : 'Free · No ads · Unsubscribe anytime',
    footer2:       zh ? '数据来源：CREA · Statistics Canada · Rentals.ca · Indeed' : 'Data: CREA · Statistics Canada · Rentals.ca · Indeed',
    dataDate:      zh ? `数据截至${qPeriod}末` : `Data through ${qPeriod}`,
    riskRent:      zh ? '租金上涨压力' : 'Rent Pressure',
    riskEnergy:    zh ? '能源价格波动' : 'Energy Volatility',
    riskClimate:   zh ? '极端气候适应' : 'Climate Adaptation',
    riskRentBody:  zh ? '移民净流入持续推动需求；若新房供给未能跟上，短期租金可能加速上涨。' : 'Net migration inflows sustain demand; rent may accelerate if new supply falls short.',
    riskEnergyBody: zh ? '油价若跌破US$60/桶，艾伯塔能源行业用工需求可能收缩。当前油价约US$78，短期稳定。' : 'Oil below US$60/bbl could contract Alberta energy sector hiring. Currently ~US$78, stable near-term.',
    riskClimateBody: zh ? '卡尔加里冬季最低温可达-30°C，对来自温暖地区的移民存在适应挑战。' : 'Calgary winters reach −30°C. Migrants from warmer climates may face adjustment challenges.',
    riskLevelMid:  zh ? '中风险' : 'Medium',
    riskLevelLow:  zh ? '低风险' : 'Low',
  }

  const summaryText = zh
    ? `${qLabel}，${cityName}整体表现强劲，对有技能的移民工人吸引力持续上升。城市综合适配分 ${info.cityScore} 分（较上季度${info.scoreDelta}），就业机会和住房可及性均处于全国领先水平。购房年限 hpiYears ${hpiStr}，租金收入比 rpi ${rpiStr}，均为全国主要城市中的优秀水平。`
    : `${cityName} delivered a strong ${qLabel} performance, with City Fit Score at ${info.cityScore} (${info.scoreDelta}). Both employment opportunity and housing affordability remain among the best in Canada. hpiYears at ${hpiStr} and rpi at ${rpiStr} are among the most favourable in major Canadian markets.`

  const riskItems = city === 'calgary'
    ? [
        { label: t.riskRent, level: t.riskLevelMid, color: '#F59E0B', body: t.riskRentBody },
        { label: t.riskEnergy, level: t.riskLevelLow, color: '#10B981', body: t.riskEnergyBody },
        { label: t.riskClimate, level: t.riskLevelLow, color: '#10B981', body: t.riskClimateBody },
      ]
    : [
        { label: t.riskRent, level: t.riskLevelMid, color: '#F59E0B', body: t.riskRentBody },
        { label: zh ? '就业竞争加剧' : 'Job Competition', level: t.riskLevelLow, color: '#10B981', body: zh ? '随着更多移民涌入，技术工人岗位竞争可能加剧，尤其是热门职业。' : 'As more skilled migrants arrive, competition for in-demand roles may intensify.' },
        { label: zh ? '生活成本' : 'Cost of Living', level: t.riskLevelMid, color: '#F59E0B', body: zh ? '租金和日常开销持续上涨，影响初期安家预算，建议预留更多流动资金。' : 'Rising rent and daily costs impact initial settlement budgets; maintain higher liquidity reserves.' },
      ]

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:16px;background:#111827;">
<div style="font-family:Arial,-apple-system,'PingFang SC',sans-serif;max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0d1117 0%,#1a2035 100%);padding:32px 28px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="margin-bottom:20px;">${LOGO_HTML}</div>
    <div style="color:rgba(255,255,255,0.38);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">${t.reportType} · ${qLabel}</div>
    <div style="font-size:22px;font-weight:800;color:white;line-height:1.3;">${cityName} × ${occName}</div>
    <div style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:6px;">${info.province} · ${t.dataDate}</div>
  </div>

  <!-- Cover metrics (4 cards) -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${t.coverMetrics}</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding:0 6px 10px 0;vertical-align:top;">
          ${kpiCard('⭐', t.cityScore, `${info.cityScore}`, info.scoreDelta, true)}
        </td>
        <td style="width:50%;padding:0 0 10px 6px;vertical-align:top;">
          ${kpiCard('🏠', t.hpiLabel, hpiStr, zh ? '全国最优之列' : 'Among national best', true)}
        </td>
      </tr>
      <tr>
        <td style="width:50%;padding:6px 6px 0 0;vertical-align:top;">
          ${kpiCard('🔑', t.rpiLabel, rpiStr, zh ? '健康水平' : 'Healthy range', true)}
        </td>
        <td style="width:50%;padding:6px 0 0 6px;vertical-align:top;">
          ${kpiCard('💼', t.eoiLabel, demandLabel, zh ? '较上季度↑' : '↑ vs prior quarter', true)}
        </td>
      </tr>
    </table>
  </div>

  <!-- Executive Summary + Dimension scores -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">01 · ${t.execSummary}</div>
    <div style="color:rgba(255,255,255,0.75);font-size:13px;line-height:1.8;margin-bottom:20px;">${summaryText}</div>
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">${t.dimScores}</div>
    <table style="width:100%;border-collapse:collapse;">
      ${info.scores.map(s => scoreBarHtml(s.label, s.zh, s.val, zh)).join('')}
    </table>
  </div>

  <!-- Housing Trends -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">02 · ${t.housingTrends}</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding:0 6px 10px 0;vertical-align:top;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;">
            <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:6px;">${t.qhPrice}</div>
            <div style="color:white;font-size:18px;font-weight:800;font-family:monospace;">${info.housePrice}</div>
            <div style="color:${info.houseUp ? '#10B981' : '#EF4444'};font-size:11px;margin-top:4px;">${info.houseDelta} ${zh ? '季度环比' : 'QoQ'}</div>
          </div>
        </td>
        <td style="width:50%;padding:0 0 10px 6px;vertical-align:top;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;">
            <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:6px;">${t.qRent}</div>
            <div style="color:white;font-size:18px;font-weight:800;font-family:monospace;">${info.rent2br}</div>
            <div style="color:${info.rentUp ? '#10B981' : '#EF4444'};font-size:11px;margin-top:4px;">${info.rentDelta} ${zh ? '季度环比' : 'QoQ'}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:6px 0 0;">
          <div style="background:rgba(79,142,247,0.07);border:1px solid rgba(79,142,247,0.15);border-radius:8px;padding:12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:rgba(255,255,255,0.4);font-size:11px;padding:3px 0;">${zh ? '你的购房年限（2居室）' : 'Your hpiYears (2BR)'}</td>
                <td style="color:#4F8EF7;font-size:13px;font-weight:700;font-family:monospace;text-align:right;">${hpiStr}</td>
              </tr>
              <tr>
                <td style="color:rgba(255,255,255,0.4);font-size:11px;padding:3px 0;">${zh ? '你的租金收入比' : 'Your rpi'}</td>
                <td style="color:#4F8EF7;font-size:13px;font-weight:700;font-family:monospace;text-align:right;">${rpiStr}</td>
              </tr>
              <tr>
                <td style="color:rgba(255,255,255,0.4);font-size:11px;padding:3px 0;">${zh ? '5年期房贷利率' : '5yr Mortgage Rate'}</td>
                <td style="color:#4F8EF7;font-size:13px;font-weight:700;font-family:monospace;text-align:right;">${info.mortgageRate}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Employment -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">03 · ${t.employment}</div>
    ${news.map(newsItemHtml).join('')}
  </div>

  <!-- Risk Factors -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">04 · ${t.risks}</div>
    ${riskItems.map(r => `
    <div style="margin-bottom:12px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="color:white;font-size:13px;font-weight:700;">${r.label}</span>
        <span style="color:${r.color};font-size:10px;font-weight:700;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:4px;">${r.level}</span>
      </div>
      <div style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">${r.body}</div>
    </div>`).join('')}
  </div>

  <!-- 6-12 Month Outlook -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">05 · ${t.outlook6m}</div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;">
      <div style="color:rgba(255,255,255,0.65);font-size:13px;line-height:1.8;">${outlook}</div>
    </div>
  </div>

  <!-- Quarterly Verdict -->
  <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">06 · ${t.verdict}</div>
    <div style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.9;border-left:3px solid #14B8A6;padding-left:16px;">${insight}</div>
  </div>

  <!-- CTA -->
  <div style="padding:24px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
    <a href="https://lakive.com/calculate?city=${city}&occ=${occ}" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#5B5CF0);color:white;font-size:13px;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;margin:0 6px 8px;">${t.cta1}</a>
    <a href="https://lakive.com/compare?city=${city}" style="display:inline-block;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;padding:13px 24px;border-radius:10px;text-decoration:none;margin:0 6px 8px;border:1px solid rgba(255,255,255,0.1);">${t.cta2}</a>
  </div>

  <!-- Footer -->
  <div style="padding:20px 28px;">
    <p style="color:rgba(255,255,255,0.22);font-size:11px;line-height:1.9;margin:0;">
      ${t.footer1}<br/>
      Lakive City Intelligence · <a href="https://lakive.com" style="color:rgba(255,255,255,0.35);text-decoration:none;">lakive.com</a><br/>
      ${t.footer2}
    </p>
  </div>

</div>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEND CONTACTS FETCHER
// ═══════════════════════════════════════════════════════════════════════════════

interface Contact {
  id: string
  email: string
  unsubscribed: boolean
  data: {
    city?: string
    occ?: string
    propType?: string
    frequency?: string
    lang?: string
  }
}

async function fetchResendContacts(apiKey: string, audienceId: string): Promise<Contact[]> {
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) {
    console.error('Failed to fetch contacts:', await res.text())
    return []
  }
  const json = await res.json() as { data?: unknown; object?: string } | unknown[]
  // Resend wraps in { object: 'list', data: [...] }
  const raw = (json as { data?: unknown })?.data ?? json ?? []
  return Array.isArray(raw) ? raw : []
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE hpiYears LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

interface HpiCache {
  [key: string]: { hpiYears: number; rpi: number }
}

const CITY_RPI_DEFAULT: Record<string, number> = {
  vancouver: 43.6, toronto: 41.2, calgary: 24.1, montreal: 30.2, ottawa: 28.4,
}
const CITY_HPI_DEFAULT: Record<string, number> = {
  vancouver: 16.2, toronto: 15.1, calgary: 8.5, montreal: 10.0, ottawa: 9.8,
}

async function buildHpiCache(contacts: Contact[]): Promise<HpiCache> {
  const cache: HpiCache = {}
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return cache

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Collect unique city+occ+propType combos
  const combos = new Set<string>()
  for (const c of contacts) {
    if (c.unsubscribed || !c.data?.city) continue
    const city     = c.data.city
    const occ      = toDbOcc(c.data.occ ?? '')
    const propType = toDbProp(c.data.propType ?? '2br')
    combos.add(`${city}|${occ}|${propType}`)
  }

  for (const combo of combos) {
    const [city, occ, propType] = combo.split('|')
    const cacheKey = combo

    // hpiYears (buy)
    const { data: buyData } = await supabase
      .from('housing_years')
      .select('years_current')
      .eq('city_id', city)
      .eq('occupation_id', occ)
      .eq('property_type', propType)
      .eq('purpose', 'buy')
      .single()

    // rpi (rent)
    const { data: rentData } = await supabase
      .from('housing_years')
      .select('years_current')
      .eq('city_id', city)
      .eq('occupation_id', occ)
      .eq('property_type', propType)
      .eq('purpose', 'rent')
      .single()

    cache[cacheKey] = {
      hpiYears: buyData?.years_current ?? CITY_HPI_DEFAULT[city] ?? 10,
      rpi:      rentData?.years_current ?? CITY_RPI_DEFAULT[city] ?? 35,
    }
  }

  return cache
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEND EMAIL VIA RESEND
// ═══════════════════════════════════════════════════════════════════════════════

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Lakive <hello@lakive.com>', to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error(`Failed to send to ${to}:`, err)
    return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRON HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  // 1. Verify CRON_SECRET (Vercel sets this automatically for cron routes)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: 'Missing RESEND_API_KEY or RESEND_AUDIENCE_ID' }, { status: 500 })
  }

  // 2. Only run on the 5th of each month
  const now = new Date()
  if (now.getUTCDate() !== 5) {
    return NextResponse.json({ skipped: true, reason: 'not 5th', date: now.toUTCString() })
  }

  const period = computePeriod(now)

  // 3. Fetch all contacts
  const contacts = await fetchResendContacts(apiKey, audienceId)
  const active   = contacts.filter(c => !c.unsubscribed && c.data?.city)

  // 4. Pre-fetch Supabase hpiYears for all unique combos
  const hpiCache = await buildHpiCache(active)

  // 5. Process each subscriber
  let sentMonthly = 0
  let sentQuarterly = 0
  let errors = 0

  for (const contact of active) {
    const { city = 'calgary', occ = '', propType = '2br', frequency = 'monthly', lang = 'en' } = contact.data
    const l = (lang === 'zh' ? 'zh' : 'en') as 'en' | 'zh'

    // Look up personalized data
    const dbOcc   = toDbOcc(occ)
    const dbProp  = toDbProp(propType)
    const cacheKey = `${city}|${dbOcc}|${dbProp}`
    const { hpiYears, rpi } = hpiCache[cacheKey] ?? {
      hpiYears: CITY_HPI_DEFAULT[city] ?? 10,
      rpi:      CITY_RPI_DEFAULT[city] ?? 35,
    }

    const cityName = l === 'zh' ? (CITY_ZH[city] ?? city) : (CITY_EN[city] ?? city)
    const occName  = l === 'zh' ? (OCC_ZH[occ] ?? occ) : (OCC_EN[occ] ?? occ)
    const subjectCtx = occName ? `${cityName} × ${occName}` : cityName

    // Monthly brief → send to all 'monthly' subscribers
    if (frequency === 'monthly') {
      const html = monthlyBriefHtml({ city, occ, lang: l, hpiYears, rpi, period })
      const subject = l === 'zh'
        ? `${period.briefZH}月报 · ${subjectCtx} · Lakive`
        : `${period.briefEN} Monthly Brief · ${subjectCtx} · Lakive`
      const ok = await sendEmail(apiKey, contact.email, subject, html)
      if (ok) sentMonthly++; else errors++
    }

    // Quarterly report → send to all 'quarterly' subscribers on quarter months
    if (frequency === 'quarterly' && period.isQuarterMonth) {
      const html = quarterlyReportHtml({ city, occ, lang: l, hpiYears, rpi, period })
      const subject = l === 'zh'
        ? `${period.quarterLabel}季报 · ${subjectCtx} · Lakive`
        : `${period.quarterLabel} Quarterly Report · ${subjectCtx} · Lakive`
      const ok = await sendEmail(apiKey, contact.email, subject, html)
      if (ok) sentQuarterly++; else errors++
    }

    // Small delay to respect Resend rate limits
    await new Promise(r => setTimeout(r, 100))
  }

  return NextResponse.json({
    ok: true,
    period: { brief: period.briefEN, quarter: period.quarterLabel, isQuarterMonth: period.isQuarterMonth },
    sent: { monthly: sentMonthly, quarterly: sentQuarterly, errors },
    contacts: active.length,
  })
}

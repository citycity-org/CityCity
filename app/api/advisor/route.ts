import { NextRequest, NextResponse } from 'next/server'

// ── Keyword maps ──────────────────────────────────────────────────────────────

const OCCUPATION_MAP: Record<string, string[]> = {
  nurse:        ['nurse', '护士', 'nursing', 'rn', 'registered nurse'],
  doctor:       ['doctor', '医生', '医师', 'physician', 'gp', 'family doctor'],
  pharmacist:   ['pharmacist', '药剂师', 'pharmacy'],
  software_eng: ['software', 'developer', 'programmer', '程序员', '开发', 'coding', 'coder', 'backend', 'frontend', 'full stack', 'fullstack', 'web dev'],
  data_analyst: ['data analyst', 'data science', 'data scientist', '数据分析', 'analyst'],
  it_support:   ['it support', 'it technician', 'helpdesk', 'tech support'],
  electrician:  ['electrician', '电工', 'electrical'],
  engineer:     ['civil engineer', 'civil engineering', 'structural engineer'],
  plumber:      ['plumber', '水管工', 'plumbing'],
  carpenter:    ['carpenter', '木工', 'carpentry'],
  teacher:      ['teacher', '教师', '老师', 'teaching', 'educator'],
  accountant:   ['accountant', '会计', 'accounting', 'cpa', 'bookkeeper'],
  lawyer:       ['lawyer', '律师', 'attorney', 'legal'],
  police:       ['police officer', '警察', 'law enforcement'],
  firefighter:  ['firefighter', '消防员', 'fire department'],
  social_worker:['social worker', '社工', 'social work'],
  truck_driver: ['truck driver', '卡车司机', 'trucker', 'transport driver'],
  mechanic:     ['mechanic', '机修工', 'auto repair', 'automotive'],
  chef:         ['chef', '厨师', 'cook', 'culinary'],
  retail:       ['retail', '零售', 'sales associate', 'cashier'],
  self_employed:['self-employed', 'self employed', '自雇', '创业', 'business owner', '老板', 'entrepreneur'],
  freelancer:   ['freelancer', '自由职业', 'freelance', 'independent contractor'],
  retired:      ['retired', '退休', 'retirement', 'pension', 'financially independent'],
}

const OCCUPATION_LABELS: Record<string, string> = {
  nurse: 'Registered Nurse', doctor: 'Family Doctor', pharmacist: 'Pharmacist',
  software_eng: 'Software Engineer', data_analyst: 'Data Analyst', it_support: 'IT Support',
  electrician: 'Electrician', engineer: 'Civil Engineer', plumber: 'Plumber',
  carpenter: 'Carpenter', teacher: 'Teacher', accountant: 'Accountant',
  lawyer: 'Lawyer', police: 'Police Officer', firefighter: 'Firefighter',
  social_worker: 'Social Worker', truck_driver: 'Truck Driver', mechanic: 'Auto Mechanic',
  chef: 'Chef', retail: 'Retail', self_employed: 'Self-Employed', freelancer: 'Freelancer',
  retired: 'Retired',
}

const CITY_MAP: Record<string, string[]> = {
  vancouver: ['vancouver', '温哥华', 'van', 'bc', 'british columbia'],
  toronto:   ['toronto',   '多伦多', 'tor', 'gta', 'ontario'],
  calgary:   ['calgary',   '卡尔加里', 'alberta', 'ab'],
  montreal:  ['montreal',  '蒙特利尔', 'mtl', 'quebec', 'montréal'],
  ottawa:    ['ottawa',    '渥太华'],
}

const CITY_LABELS: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}

// ── Signal detectors ──────────────────────────────────────────────────────────

function detectOccupation(text: string): string | null {
  for (const [id, keywords] of Object.entries(OCCUPATION_MAP)) {
    if (keywords.some(k => text.includes(k))) return id
  }
  return null
}

function detectCities(text: string): string[] {
  return Object.entries(CITY_MAP)
    .filter(([, kws]) => kws.some(k => text.includes(k)))
    .map(([id]) => id)
}

function detectHasChildren(text: string): boolean {
  return /children|kids|child|孩子|小孩|family with|带.*孩|有孩|two kids|three kids/.test(text)
}

function detectIsImmigrant(text: string): boolean {
  return /immigrat|移民|新移民|coming to canada|moving to canada|搬去加拿大|落脚|landing|arrive|来加拿大/.test(text)
}

function detectPriority(text: string): string | null {
  if (/buy.*home|buy.*house|购房|买房|homeown|afford.*hous|housing|rent high|rent too/.test(text)) return 'housing'
  if (/job|employment|find work|就业|找工|工作机会|career|opportunity|job market/.test(text)) return 'employment'
  if (/school|education|孩子上学|教育|学校|kids.*school/.test(text)) return 'education'
  if (/cheap|affordable|low cost|便宜|预算|budget|cost of living|生活成本/.test(text)) return 'affordability'
  if (/tax|税/.test(text)) return 'tax'
  return null
}

// ── Recommendation engine ─────────────────────────────────────────────────────

interface Recommendation {
  text: string
  url: string
  ctaText: string
  highlightCities: string[]
}

function buildRecommendation(
  occupation: string | null,
  cities: string[],
  hasChildren: boolean,
  isImmigrant: boolean,
  priority: string | null,
): Recommendation {

  const occ = occupation ?? 'nurse' // default for URL
  const occLabel = occupation ? OCCUPATION_LABELS[occupation] : null

  // Two specific cities mentioned → Compare
  if (cities.length >= 2) {
    const [a, b] = cities
    const url = `/compare?cities=${a},${b}${occupation ? `&occupation=${occ}` : ''}`
    return {
      text: `You're weighing ${CITY_LABELS[a]} vs ${CITY_LABELS[b]}${occLabel ? ` as a ${occLabel}` : ''}. The comparison tool breaks down income, housing, and taxes side by side.`,
      url,
      ctaText: `Compare ${CITY_LABELS[a]} vs ${CITY_LABELS[b]} →`,
      highlightCities: [a, b],
    }
  }

  // Housing priority → Calgary leads on affordability
  if (priority === 'housing' || priority === 'affordability') {
    const url = `/ranking?occupation=${occ}&region=canada`
    return {
      text: `Housing affordability is your top concern${occLabel ? ` as a ${occLabel}` : ''}. Calgary stands out — trades and professionals typically reach homeownership in under 5 income years, compared to 10–14 in Vancouver or Toronto.`,
      url,
      ctaText: 'View cities ranked by housing affordability →',
      highlightCities: ['calgary', 'ottawa'],
    }
  }

  // Employment / immigration focus
  if (isImmigrant || priority === 'employment') {
    const url = `/ranking?occupation=${occ}&region=canada`
    const cityNote = hasChildren
      ? 'Calgary and Ottawa combine strong job markets with family-friendly costs.'
      : 'Calgary and Toronto have the highest employment demand across most occupations.'
    return {
      text: `${occLabel ? `For ${occLabel}s` : 'For newcomers'} choosing where to land, job demand and affordability are the two variables that matter most. ${cityNote}`,
      url,
      ctaText: `See city rankings${occLabel ? ` for ${occLabel}s` : ''} →`,
      highlightCities: ['calgary', hasChildren ? 'ottawa' : 'toronto'],
    }
  }

  // Education / family priority
  if (priority === 'education' || hasChildren) {
    const url = `/ranking?occupation=${occ}&region=canada`
    return {
      text: `With children in the picture, school access and neighbourhood stability matter as much as income. Ottawa and Calgary offer strong public education systems with lower housing pressure than Vancouver or Toronto.`,
      url,
      ctaText: 'Find the right fit for your family →',
      highlightCities: ['ottawa', 'calgary'],
    }
  }

  // Tax priority
  if (priority === 'tax') {
    const url = `/calculate${occupation ? `?occupation=${occ}` : ''}`
    return {
      text: `Tax efficiency varies significantly by province. Alberta has no provincial income tax — for${occLabel ? ` a ${occLabel}` : ' most occupations'}, this translates to $3,000–$8,000 more take-home annually compared to BC or Ontario.`,
      url,
      ctaText: 'Model your after-tax income by city →',
      highlightCities: ['calgary'],
    }
  }

  // Retired / financially independent
  if (occupation === 'retired') {
    return {
      text: 'For retirement, cost of living and healthcare access are the key variables. Calgary and Ottawa offer stable services without the extreme housing costs of coastal cities.',
      url: '/ranking?occupation=retired&region=canada',
      ctaText: 'Compare cities for retirement →',
      highlightCities: ['calgary', 'ottawa'],
    }
  }

  // One city mentioned → suggest compare or ranking anchored to it
  if (cities.length === 1) {
    const city = cities[0]
    const url = `/ranking?occupation=${occ}&current=${city}`
    return {
      text: `You're considering ${CITY_LABELS[city]}${occLabel ? ` as a ${occLabel}` : ''}. See how it stacks up against other cities on income, housing, and opportunity.`,
      url,
      ctaText: `Compare cities starting from ${CITY_LABELS[city]} →`,
      highlightCities: [city],
    }
  }

  // Generic with occupation
  if (occupation) {
    return {
      text: `As a ${OCCUPATION_LABELS[occupation]}, your income potential varies significantly by city. Calgary, Toronto, and Ottawa tend to offer the best combination of job demand and affordability for most occupations.`,
      url: `/ranking?occupation=${occ}`,
      ctaText: `View city rankings for ${OCCUPATION_LABELS[occupation]}s →`,
      highlightCities: ['calgary', 'toronto', 'ottawa'],
    }
  }

  // Fallback
  return {
    text: "Tell us a bit more — your occupation, whether you're coming from abroad or already in Canada, and what matters most (housing, jobs, schools). We'll point you to the most relevant data.",
    url: '/ranking',
    ctaText: 'Explore city rankings →',
    highlightCities: [],
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const text = query.toLowerCase()

  const occupation  = detectOccupation(text)
  const cities      = detectCities(text)
  const hasChildren = detectHasChildren(text)
  const isImmigrant = detectIsImmigrant(text)
  const priority    = detectPriority(text)

  // Build "understood" chips for UI
  const understood: string[] = []
  if (occupation)  understood.push(OCCUPATION_LABELS[occupation])
  if (hasChildren) understood.push('Has children')
  if (isImmigrant) understood.push('Moving to Canada')
  cities.forEach(c => understood.push(CITY_LABELS[c]))
  if (priority === 'housing')      understood.push('Housing priority')
  if (priority === 'employment')   understood.push('Job market priority')
  if (priority === 'education')    understood.push('Education priority')
  if (priority === 'affordability')understood.push('Affordability priority')
  if (priority === 'tax')          understood.push('Tax efficiency')

  const recommendation = buildRecommendation(occupation, cities, hasChildren, isImmigrant, priority)

  return NextResponse.json({ understood, recommendation })
}

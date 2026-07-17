// ── SEO Guide Data ────────────────────────────────────────────────────────────
// Powers programmatic landing pages (30 occupations × N cities)

export type OccupationData = {
  id: string
  name: string
  salary: number    // CAD annual avg
  salaryUS?: number // USD annual avg (for US cities)
  category: 'high-income' | 'tech' | 'trades' | 'healthcare' | 'professional' | 'public' | 'service'
  demandNote: string
  licenseNote?: string
}

export type CityData = {
  name: string
  displayName: string
  province: string            // state/province label
  country?: 'CA' | 'US'      // default 'CA'
  currency?: 'CAD' | 'USD'   // default 'CAD'
  benchmarkSalary?: number    // median salary used to calibrate benchmarkHpi (default 75000 CAD)
  benchmarkHpi: number        // years to own 2BR at benchmarkSalary
  avgRent2BR: number          // monthly rent in local currency
  taxNote: string
  sectorNote: string
  immigrantNote: string
  eiuRank?: number            // EIU Global Liveability Index rank (out of 173 cities)
  eiuYear?: number            // year of EIU ranking
}

// ── Occupations ───────────────────────────────────────────────────────────────
// CA salary source: StatCan, Indeed CA, Government of Canada Job Bank (2025–2026)
// US salary source: BLS, Glassdoor, LinkedIn Salary (2025–2026)
export const OCCUPATIONS: Record<string, OccupationData> = {
  'registered-nurse': {
    id: 'nurse', name: 'Registered Nurse', salary: 84000, salaryUS: 92000, category: 'healthcare',
    demandNote: 'Nursing shortages persist across all provinces and US states. New immigrants with foreign credentials typically complete bridging programs before full licensure.',
    licenseNote: 'Canada: Provincial nursing college registration required (NCLEX-RN). US: State nursing board licensure (NCLEX-RN). Credential recognition varies by jurisdiction.',
  },
  'family-physician': {
    id: 'doctor', name: 'Family Physician', salary: 230000, salaryUS: 255000, category: 'high-income',
    demandNote: 'Critical shortage in suburban and rural areas across Canada and the US. Urban positions are competitive. IMG routes vary significantly by country and state/province.',
    licenseNote: 'Canada: Medical Council of Canada licensing + CaRMS residency matching. US: USMLE Steps 1–3 + residency matching through NRMP (ECFMG certification required for IMGs).',
  },
  'pharmacist': {
    id: 'pharmacist', name: 'Pharmacist', salary: 105000, salaryUS: 122000, category: 'healthcare',
    demandNote: 'Stable demand. Scope of practice has expanded in both Canada and the US — pharmacists can now prescribe for minor ailments in many jurisdictions.',
    licenseNote: 'Canada: PEBC qualifying exams + provincial college registration. US: NAPLEX + MPJE + state licensure. Foreign pharmacy degrees assessed separately.',
  },
  'dentist': {
    id: 'dentist', name: 'Dentist', salary: 185000, salaryUS: 205000, category: 'high-income',
    demandNote: 'Strong demand. Canada: accelerated by federal Dental Care Plan. US: growing demand driven by aging population and expanding dental insurance coverage.',
    licenseNote: 'Canada: NDEB certification required for international graduates. US: NBDE (Parts 1 & 2) + state dental board licensure + WREB/ADLEX clinical exams.',
  },
  'social-worker': {
    id: 'social_worker', name: 'Social Worker', salary: 65000, salaryUS: 57000, category: 'public',
    demandNote: 'Steady government and nonprofit demand in both countries. Child welfare and immigrant services see consistent hiring.',
  },
  'software-engineer': {
    id: 'software_eng', name: 'Software Engineer', salary: 110000, salaryUS: 152000, category: 'tech',
    demandNote: 'Strong demand across Canada and the US. US West Coast (Seattle, SF) offers the highest global salaries. Remote work has expanded opportunities nationally.',
  },
  'data-analyst': {
    id: 'data_analyst', name: 'Data Analyst', salary: 80000, salaryUS: 90000, category: 'tech',
    demandNote: 'Growing across finance, energy, retail, and healthcare in both countries. SQL and Python skills are the baseline expectation.',
  },
  'it-support': {
    id: 'it_support', name: 'IT Support Specialist', salary: 62000, salaryUS: 62000, category: 'tech',
    demandNote: 'Consistent demand across all city sizes. Government and public sector positions offer stability and benefits.',
  },
  'electrician': {
    id: 'electrician', name: 'Electrician', salary: 82000, salaryUS: 80000, category: 'trades',
    demandNote: 'High demand in energy and construction sectors in both countries. Canada: Red Seal certification. US: journeyman and master electrician licenses are state-regulated.',
    licenseNote: 'Canada: Red Seal Interprovincial Standard or provincial journeyperson certificate. US: state-issued journeyman or master electrician licence (requirements vary by state).',
  },
  'plumber': {
    id: 'plumber', name: 'Plumber', salary: 78000, salaryUS: 75000, category: 'trades',
    demandNote: 'Shortage of licensed tradespeople in most cities in both Canada and the US. New construction and aging infrastructure both drive demand.',
    licenseNote: 'Canada: Provincial journeyperson certificate (Red Seal allows mobility). US: state-issued journeyman or master plumber licence.',
  },
  'carpenter': {
    id: 'carpenter', name: 'Carpenter', salary: 67000, salaryUS: 62000, category: 'trades',
    demandNote: 'Demand tied to construction activity. Active residential and commercial projects in most major metros.',
    licenseNote: 'Canada: Red Seal certification recommended for interprovincial mobility. US: no federal licence required; some states require journeyman certification.',
  },
  'welder': {
    id: 'welder', name: 'Welder', salary: 66000, salaryUS: 58000, category: 'trades',
    demandNote: "Strong demand in industrial and energy sectors. Canada: CWB credentials command higher wages. US: AWS certification preferred by most industrial employers.",
    licenseNote: "Canada: CWB (Canadian Welding Bureau) certification. US: AWS (American Welding Society) certification preferred.",
  },
  'auto-mechanic': {
    id: 'mechanic', name: 'Auto Mechanic', salary: 65000, salaryUS: 48000, category: 'trades',
    demandNote: 'Consistent demand. EV transition is creating upskilling opportunities — HV-certified technicians earn a premium in both markets.',
    licenseNote: 'Canada: Automotive Service Technician Certificate of Qualification (310S). US: ASE (Automotive Service Excellence) certification preferred.',
  },
  'construction-worker': {
    id: 'construction_worker', name: 'Construction Worker', salary: 58000, salaryUS: 58000, category: 'trades',
    demandNote: 'High demand in all major cities. Calgary and US Sun Belt cities have been among the fastest-growing construction markets.',
  },
  'civil-engineer': {
    id: 'engineer', name: 'Civil Engineer', salary: 90000, salaryUS: 96000, category: 'professional',
    demandNote: 'Strong demand in infrastructure development, urban planning, and transit. P.Eng./PE designation increases earning potential significantly.',
    licenseNote: 'Canada: P.Eng. (Professional Engineer) via Engineers Canada. US: PE (Professional Engineer) licence via NCEES exams — required for independent practice.',
  },
  'lawyer': {
    id: 'lawyer', name: 'Lawyer', salary: 130000, salaryUS: 148000, category: 'high-income',
    demandNote: 'Competitive market. Immigration law, real estate, and corporate practice are in high demand. International law degrees require jurisdiction-specific assessment.',
    licenseNote: 'Canada: NCA (National Committee on Accreditation) assessment + provincial bar. US: LL.M. often required for foreign lawyers + state bar exam (requirements vary by state).',
  },
  'accountant': {
    id: 'accountant', name: 'Accountant (CPA)', salary: 72000, salaryUS: 78000, category: 'professional',
    demandNote: 'Stable demand across all industries. CPA designation adds significantly to mid-career salary in both Canada and the US.',
    licenseNote: 'Canada: CPA Canada credential. US: CPA licence via state board of accountancy (150 credit hours + Uniform CPA Exam).',
  },
  'financial-advisor': {
    id: 'financial_advisor', name: 'Financial Advisor', salary: 85000, salaryUS: 92000, category: 'professional',
    demandNote: 'Growing demand, particularly in immigrant wealth management and retirement planning. Commission structures can significantly exceed base in both markets.',
  },
  'real-estate-agent': {
    id: 'real_estate', name: 'Real Estate Agent', salary: 72000, salaryUS: 65000, category: 'professional',
    demandNote: 'Highly variable income tied to market conditions. Active markets in Calgary, Seattle, and suburban US regions offer the most accessible entry.',
    licenseNote: 'Canada: Provincial real estate licence (e.g., OREA in Ontario, UBC Sauder in BC). US: State real estate salesperson licence (pre-licensing + state exam).',
  },
  'marketing-specialist': {
    id: 'marketing', name: 'Marketing Specialist', salary: 68000, salaryUS: 68000, category: 'professional',
    demandNote: 'Concentrated in major metros. Remote work has opened access to higher-paying markets in both Canada and the US.',
  },
  'hr-specialist': {
    id: 'hr', name: 'HR Specialist', salary: 65000, salaryUS: 65000, category: 'professional',
    demandNote: 'Steady demand in corporate sectors. CPHR (Canada) and SHRM-CP (US) designations valued by larger employers.',
  },
  'secondary-teacher': {
    id: 'teacher', name: 'Secondary School Teacher', salary: 78000, salaryUS: 62000, category: 'public',
    demandNote: 'Shortage in rural areas and STEM subjects in both countries. Urban boards are competitive but actively hiring.',
    licenseNote: 'Canada: Provincial teacher certification (ministries of education). US: State teaching credential + subject matter competency exam. Foreign credentials assessed separately.',
  },
  'firefighter': {
    id: 'firefighter', name: 'Firefighter', salary: 88000, salaryUS: 78000, category: 'public',
    demandNote: 'Highly competitive entry in both countries. Strong union, pension, and benefits make it one of the most stable public sector careers.',
  },
  'police-officer': {
    id: 'police', name: 'Police Officer', salary: 92000, salaryUS: 82000, category: 'public',
    demandNote: 'Active hiring in several Canadian and US cities. Canada: most forces require citizenship. US: requirements vary by department.',
  },
  'truck-driver': {
    id: 'truck_driver', name: 'Truck Driver', salary: 72000, salaryUS: 68000, category: 'trades',
    demandNote: 'Critical shortage in both countries. Long-haul routes command premium wages. LMIA-exempt pathways available in Canada; CDL sponsorship common in the US.',
    licenseNote: 'Canada: Class 1/AZ licence. US: CDL (Commercial Driver\'s Licence) Class A — federal FMCSA requirements apply across all states.',
  },
  'commercial-pilot': {
    id: 'pilot', name: 'Commercial Pilot', salary: 145000, salaryUS: 182000, category: 'high-income',
    demandNote: 'Strong demand as aviation recovers. US airlines offer some of the highest captain salaries globally. Cadet programs actively recruiting.',
    licenseNote: 'Canada: Transport Canada CPL/ATPL. US: FAA CPL/ATP + type rating. Foreign licence conversion available — process differs by country.',
  },
  'chef': {
    id: 'chef', name: 'Chef', salary: 52000, salaryUS: 48000, category: 'service',
    demandNote: 'High turnover industry. Executive and sous chef roles command a significant premium over line cook wages in both markets.',
  },
  'retail-associate': {
    id: 'retail', name: 'Retail Associate', salary: 42000, salaryUS: 34000, category: 'service',
    demandNote: 'Entry-level access with no formal requirements. Often used as a first job on arrival. US wages vary significantly by state minimum wage.',
  },
  'security-guard': {
    id: 'security', name: 'Security Guard', salary: 46000, salaryUS: 38000, category: 'service',
    demandNote: 'Steady demand. Government, airport, and corporate security positions pay notably more than retail in both countries.',
    licenseNote: 'Canada: Provincial security guard licence. US: State guard card or security licence — most states require background check and training hours.',
  },
  'cleaner': {
    id: 'cleaner', name: 'Cleaner / Janitor', salary: 40000, salaryUS: 36000, category: 'service',
    demandNote: 'Consistent demand. Commercial and government contracts offer better stability and hourly rates than residential cleaning.',
  },
}

// ── Cities ────────────────────────────────────────────────────────────────────
// CA: benchmarkHpi calibrated to ~$75K CAD median salary
// US: benchmarkHpi calibrated to city-specific USD median salary (benchmarkSalary)
export const CITIES: Record<string, CityData> = {
  // ── Canada ──────────────────────────────────────────────────────────────────
  'vancouver': {
    name: 'Vancouver', displayName: 'Vancouver', province: 'British Columbia', country: 'CA', currency: 'CAD',
    benchmarkHpi: 16.2, avgRent2BR: 3100,
    taxNote: 'BC has a 5.06%–20.5% provincial income tax and 7% PST on goods.',
    sectorNote: 'Tech (Amazon, Microsoft, EA, Capcom), film and TV production, and port/logistics drive Vancouver\'s economy.',
    immigrantNote: 'Canada\'s largest Chinese-speaking community outside China. Strong Cantonese and Mandarin services across healthcare, finance, and real estate.',
    eiuRank: 9, eiuYear: 2026,
  },
  'toronto': {
    name: 'Toronto', displayName: 'Toronto', province: 'Ontario', country: 'CA', currency: 'CAD',
    benchmarkHpi: 15.1, avgRent2BR: 2850,
    taxNote: 'Ontario has a 5.05%–13.16% provincial income tax and HST of 13%.',
    sectorNote: 'Canada\'s financial capital. Strong in finance, consulting, tech, and media. Most diverse job market nationally.',
    immigrantNote: 'Most diverse city in Canada. Large South Asian, Chinese, and Filipino communities with extensive settlement support.',
    eiuRank: 16, eiuYear: 2025,
  },
  'calgary': {
    name: 'Calgary', displayName: 'Calgary', province: 'Alberta', country: 'CA', currency: 'CAD',
    benchmarkHpi: 8.5, avgRent2BR: 1900,
    taxNote: 'Alberta has lower provincial income tax rates (10–15%) than BC or Ontario, plus no PST — a meaningful cost advantage, though provincial income tax does apply.',
    sectorNote: 'Energy sector, construction, tech (rapidly growing), and agriculture. Highest average household income of any major Canadian city.',
    immigrantNote: 'Fastest-growing immigrant population in Canada. Active federal and provincial nomination streams. Large Filipino, South Asian, and Chinese communities.',
    eiuRank: 18, eiuYear: 2025,
  },
  'montreal': {
    name: 'Montreal', displayName: 'Montréal', province: 'Quebec', country: 'CA', currency: 'CAD',
    benchmarkHpi: 10.0, avgRent2BR: 1950,
    taxNote: 'Quebec has the highest combined provincial income tax in Canada (up to 25.75%). Offset by subsidized daycare ($10/day) and lower tuition.',
    sectorNote: 'AI research hub (Mila, Element AI), aerospace (Bombardier, CAE), gaming (Ubisoft), and bilingual business services.',
    immigrantNote: 'French language proficiency is a practical requirement for most employment outside anglophone sectors. Bill 96 strengthens French requirements.',
    eiuRank: 19, eiuYear: 2025,
  },
  'ottawa': {
    name: 'Ottawa', displayName: 'Ottawa', province: 'Ontario', country: 'CA', currency: 'CAD',
    benchmarkHpi: 9.8, avgRent2BR: 2100,
    taxNote: 'Ontario provincial income tax applies. More affordable than Toronto with similar tax structure.',
    sectorNote: 'Federal public service is the dominant employer. Growing tech sector (Shopify HQ, Invest Ottawa). Stable, government-anchored economy.',
    immigrantNote: 'Strong settlement infrastructure due to federal government presence. Less intense competition for housing than Toronto.',
  },

  // ── United States ────────────────────────────────────────────────────────────
  'seattle': {
    name: 'Seattle', displayName: 'Seattle', province: 'Washington State', country: 'US', currency: 'USD',
    benchmarkSalary: 82000,
    benchmarkHpi: 8.8, avgRent2BR: 2700,
    taxNote: 'Washington has NO state income tax — one of only 9 states. This gives Seattle workers a significant take-home advantage over California peers at the same gross salary.',
    sectorNote: 'Amazon and Microsoft HQs anchor Seattle\'s economy. Boeing aerospace, Allen Institute biotech, and a fast-growing startup ecosystem add diversification.',
    immigrantNote: 'Major H-1B sponsor base — Amazon and Microsoft collectively sponsor thousands annually. TN visa available for Canadian and Mexican professionals. Strong Chinese and South Asian tech communities.',
  },
  'san-francisco': {
    name: 'San Francisco', displayName: 'San Francisco', province: 'California', country: 'US', currency: 'USD',
    benchmarkSalary: 88000,
    benchmarkHpi: 15.6, avgRent2BR: 3500,
    taxNote: 'California has the highest marginal state income tax in the US — up to 13.3%. Combined with federal tax, high earners face 40–50% effective rates. No state capital gains exemption.',
    sectorNote: 'Global tech capital: Apple, Google, Meta, Salesforce, and thousands of startups. Biotech, venture capital, and fintech are also major sectors. Highest average tech salaries in North America.',
    immigrantNote: 'One of the highest concentrations of H-1B visa holders in the US. Significant Mandarin and Cantonese-speaking communities in the Bay Area. Long-term immigration heavily dependent on employer sponsorship — EB-2/EB-3 backlogs are substantial.',
  },
  'new-york': {
    name: 'New York', displayName: 'New York City', province: 'New York State', country: 'US', currency: 'USD',
    benchmarkSalary: 80000,
    benchmarkHpi: 14.8, avgRent2BR: 3700,
    taxNote: 'New York State (up to 10.9%) plus NYC city income tax (up to 3.876%) combine for one of the highest total income tax burdens in the US. Finance and law salaries are structured to offset this.',
    sectorNote: 'Global financial capital: Wall Street, Goldman Sachs, JPMorgan. Media, healthcare (Cornell, NYU Langone), and a growing tech sector (Google, Amazon offices) round out the market.',
    immigrantNote: 'Most diverse city in the US — over 800 languages spoken. Large Cantonese and Mandarin communities in Manhattan Chinatown, Flushing (Queens), and Sunset Park (Brooklyn). Extensive ethnic business networks.',
    eiuRank: 66, eiuYear: 2026,
  },
  'boston': {
    name: 'Boston', displayName: 'Boston', province: 'Massachusetts', country: 'US', currency: 'USD',
    benchmarkSalary: 78000,
    benchmarkHpi: 11.8, avgRent2BR: 3100,
    taxNote: 'Massachusetts has a flat 5% state income tax — lower and more predictable than New York or California. No local income tax. Sales tax of 6.25%.',
    sectorNote: 'Global leader in biotech (Moderna, Biogen, Vertex), world-class hospital systems (MGH, Brigham and Women\'s), and top universities (MIT, Harvard). Financial services and consulting add depth.',
    immigrantNote: 'Strong international student pipeline from MIT, Harvard, and other universities drives immigrant professional talent. Chinese and Indian communities concentrated in Cambridge and Quincy. Active H-1B and O-1 visa sponsorship in biotech and academia.',
  },
}

// ── Calculations ──────────────────────────────────────────────────────────────
const MEDIAN_SALARY_CAD = 75000

export function calcHpiYears(occSlug: string, citySlug: string): number {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return 0
  const isUS       = city.currency === 'USD'
  const salary     = isUS ? (occ.salaryUS ?? Math.round(occ.salary * 1.28)) : occ.salary
  const benchmark  = city.benchmarkSalary ?? MEDIAN_SALARY_CAD
  return Math.round(city.benchmarkHpi * (benchmark / salary) * 10) / 10
}

export function calcRpi(occSlug: string, citySlug: string): number {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return 0
  const isUS   = city.currency === 'USD'
  const salary = isUS ? (occ.salaryUS ?? Math.round(occ.salary * 1.28)) : occ.salary
  return Math.round((city.avgRent2BR * 12 / salary) * 100 * 10) / 10
}

// Lakive 5-level rating system
// Level = max(hpiLevel, rpiLevel)
// hpiLevel: L1≤5 | L2≤8 | L3≤12 | L4≤18 | L5>18
// rpiLevel: L1≤25% | L2≤30% | L3≤38% | L4≤50% | L5>50%
export const LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: 'L1 Lower Pressure',  color: '#14B8A6' },
  2: { label: 'L2 Manageable',      color: '#10B981' },
  3: { label: 'L3 Under Pressure',  color: '#F59E0B' },
  4: { label: 'L4 Difficult',       color: '#E86C2F' },
  5: { label: 'L5 Severe Pressure', color: '#EF4444' },
}

export function hpiLevel(years: number): 1|2|3|4|5 {
  if (years <= 5)  return 1
  if (years <= 8)  return 2
  if (years <= 12) return 3
  if (years <= 18) return 4
  return 5
}

export function rpiLevel(rpi: number): 1|2|3|4|5 {
  if (rpi <= 25) return 1
  if (rpi <= 30) return 2
  if (rpi <= 38) return 3
  if (rpi <= 50) return 4
  return 5
}

export function calcLevel(hpiYears: number, rpiPct: number): 1|2|3|4|5 {
  return Math.max(hpiLevel(hpiYears), rpiLevel(rpiPct)) as 1|2|3|4|5
}

// Legacy helpers — kept for backward compatibility, now map to 5-level system
export function hpiLabel(years: number): { text: string; color: string } {
  const lv = hpiLevel(years)
  return { text: LEVEL_META[lv].label, color: LEVEL_META[lv].color }
}

export function rpiLabel(rpi: number): { text: string; color: string } {
  const lv = rpiLevel(rpi)
  return { text: LEVEL_META[lv].label, color: LEVEL_META[lv].color }
}

// Returns other cities ranked best→worst for this occupation
export function rankedCities(occSlug: string, excludeCity: string): { slug: string; years: number; rpi: number }[] {
  return Object.keys(CITIES)
    .filter(c => c !== excludeCity)
    .map(c => ({ slug: c, years: calcHpiYears(occSlug, c), rpi: calcRpi(occSlug, c) }))
    .sort((a, b) => a.years - b.years)
}

export function formatYears(y: number): string {
  const yr  = Math.floor(y)
  const mo  = Math.round((y - yr) * 12)
  if (mo === 0) return `${yr} yr`
  return `${yr} yr ${mo} mo`
}

export function formatSalary(n: number): string {
  return '$' + (n / 1000).toFixed(0) + 'K'
}

export function formatSalaryUS(n: number): string {
  return '$' + (n / 1000).toFixed(0) + 'K USD'
}

export function getCityCountry(citySlug: string): 'CA' | 'US' {
  return CITIES[citySlug]?.country ?? 'CA'
}

export function getCityCurrency(citySlug: string): 'CAD' | 'USD' {
  return CITIES[citySlug]?.currency ?? 'CAD'
}

// ── SEO Guide Data ────────────────────────────────────────────────────────────
// Powers 150 programmatic landing pages (30 occupations × 5 cities)

export type OccupationData = {
  id: string
  name: string
  salary: number   // CAD annual avg
  category: 'high-income' | 'tech' | 'trades' | 'healthcare' | 'professional' | 'public' | 'service'
  demandNote: string
  licenseNote?: string
}

export type CityData = {
  name: string
  displayName: string   // with accent if needed
  province: string
  benchmarkHpi: number  // years to own 2BR, based on median salary
  avgRent2BR: number    // monthly CAD
  taxNote: string
  sectorNote: string
  immigrantNote: string
}

// ── Occupations ───────────────────────────────────────────────────────────────
// Salary source: StatCan, Indeed CA, Government of Canada Job Bank (2025)
export const OCCUPATIONS: Record<string, OccupationData> = {
  'registered-nurse': {
    id: 'nurse', name: 'Registered Nurse', salary: 84000, category: 'healthcare',
    demandNote: 'Nursing shortages persist across all provinces. New immigrants with foreign credentials typically complete bridging programs before full licensure.',
    licenseNote: 'Provincial nursing college registration required (NCLEX-RN). Credential recognition varies by province.',
  },
  'family-physician': {
    id: 'doctor', name: 'Family Physician', salary: 230000, category: 'high-income',
    demandNote: 'Critical shortage in suburban and rural areas. Urban positions are competitive. IMG (International Medical Graduate) routes vary by province.',
    licenseNote: 'Medical Council of Canada licensing required. Residency matching through CaRMS for IMGs.',
  },
  'pharmacist': {
    id: 'pharmacist', name: 'Pharmacist', salary: 105000, category: 'healthcare',
    demandNote: 'Stable demand. Scope of practice has expanded — pharmacists can now prescribe minor ailments in most provinces.',
    licenseNote: 'PEBC qualifying exams required. Provincial licensure through respective regulatory colleges.',
  },
  'dentist': {
    id: 'dentist', name: 'Dentist', salary: 185000, category: 'high-income',
    demandNote: 'Strong demand accelerated by new federal Canadian Dental Care Plan. Private practice ownership offers highest earning potential.',
    licenseNote: 'NDEB (National Dental Examining Board) certification required for internationally trained dentists.',
  },
  'social-worker': {
    id: 'social_worker', name: 'Social Worker', salary: 65000, category: 'public',
    demandNote: 'Steady government and nonprofit demand. Child welfare and immigrant services see consistent hiring.',
  },
  'software-engineer': {
    id: 'software_eng', name: 'Software Engineer', salary: 110000, category: 'tech',
    demandNote: 'Strong demand in Vancouver and Toronto tech hubs. Calgary\'s tech sector is growing. Remote work has expanded opportunities nationally.',
  },
  'data-analyst': {
    id: 'data_analyst', name: 'Data Analyst', salary: 80000, category: 'tech',
    demandNote: 'Growing across finance, energy, retail, and healthcare. SQL and Python skills are the baseline expectation.',
  },
  'it-support': {
    id: 'it_support', name: 'IT Support Specialist', salary: 62000, category: 'tech',
    demandNote: 'Consistent demand across all city sizes. Government and public sector positions offer stability and benefits.',
  },
  'electrician': {
    id: 'electrician', name: 'Electrician', salary: 82000, category: 'trades',
    demandNote: 'High demand in Alberta driven by energy sector and construction boom. Interprovincial Red Seal certification is recognized Canada-wide.',
    licenseNote: 'Red Seal Interprovincial Standard or provincial journeyperson certificate required.',
  },
  'plumber': {
    id: 'plumber', name: 'Plumber', salary: 78000, category: 'trades',
    demandNote: 'Shortage of licensed tradespeople in most cities. New construction and aging infrastructure both drive demand.',
    licenseNote: 'Provincial journeyperson certificate required. Red Seal allows mobility across provinces.',
  },
  'carpenter': {
    id: 'carpenter', name: 'Carpenter', salary: 67000, category: 'trades',
    demandNote: 'Demand tied to construction activity. Calgary and Vancouver lead in active residential and commercial projects.',
    licenseNote: 'Red Seal certification recommended for interprovincial mobility.',
  },
  'welder': {
    id: 'welder', name: 'Welder', salary: 66000, category: 'trades',
    demandNote: 'Strong demand in Alberta\'s oil and gas sector. Certified welders with CWB credentials command higher wages.',
    licenseNote: 'CWB (Canadian Welding Bureau) certification preferred by most industrial employers.',
  },
  'auto-mechanic': {
    id: 'mechanic', name: 'Auto Mechanic', salary: 65000, category: 'trades',
    demandNote: 'Consistent demand. EV transition is creating upskilling opportunities — HV-certified technicians earn a premium.',
    licenseNote: 'Automotive Service Technician Certificate of Qualification (310S) required in most provinces.',
  },
  'construction-worker': {
    id: 'construction_worker', name: 'Construction Worker', salary: 58000, category: 'trades',
    demandNote: 'High demand in all major cities. Calgary has been among the fastest-growing construction markets in Canada.',
  },
  'civil-engineer': {
    id: 'engineer', name: 'Civil Engineer', salary: 90000, category: 'professional',
    demandNote: 'Strong demand in infrastructure development, urban planning, and transit projects. P.Eng. designation increases earning potential significantly.',
    licenseNote: 'P.Eng. (Professional Engineer) licensure required for independent practice. Engineers Canada oversees recognition.',
  },
  'lawyer': {
    id: 'lawyer', name: 'Lawyer', salary: 130000, category: 'high-income',
    demandNote: 'Competitive market. Immigration law, real estate, and corporate practice are in high demand. International law degrees require NCA evaluation.',
    licenseNote: 'NCA (National Committee on Accreditation) assessment required for foreign-trained lawyers. Provincial bar admission follows.',
  },
  'accountant': {
    id: 'accountant', name: 'Accountant (CPA)', salary: 72000, category: 'professional',
    demandNote: 'Stable demand across all industries. CPA designation adds roughly $15,000–$25,000 to annual salary at mid-career.',
    licenseNote: 'CPA Canada credential or NCA-recognized foreign designation for public accounting.',
  },
  'financial-advisor': {
    id: 'financial_advisor', name: 'Financial Advisor', salary: 85000, category: 'professional',
    demandNote: 'Growing demand, particularly in immigrant wealth management and retirement planning. Commission structures can significantly exceed base.',
  },
  'real-estate-agent': {
    id: 'real_estate', name: 'Real Estate Agent', salary: 72000, category: 'professional',
    demandNote: 'Highly variable income tied to market conditions. Active markets in Calgary and suburban regions offer the most accessible entry.',
    licenseNote: 'Provincial real estate license required. Pre-licensing courses vary by province (e.g., OREA in Ontario, UBC Sauder in BC).',
  },
  'marketing-specialist': {
    id: 'marketing', name: 'Marketing Specialist', salary: 68000, category: 'professional',
    demandNote: 'Concentrated in Toronto and Vancouver. Remote work has opened access to these higher-paying markets from other cities.',
  },
  'hr-specialist': {
    id: 'hr', name: 'HR Specialist', salary: 65000, category: 'professional',
    demandNote: 'Steady demand in corporate sectors. CPHR (Chartered Professional in Human Resources) designation valued by larger employers.',
  },
  'secondary-teacher': {
    id: 'teacher', name: 'Secondary School Teacher', salary: 78000, category: 'public',
    demandNote: 'Shortage in rural areas and STEM subjects. Urban boards are competitive but actively hiring. Pension and benefits are strong.',
    licenseNote: 'Provincial teacher certification required. Foreign credentials assessed by provincial ministries of education.',
  },
  'firefighter': {
    id: 'firefighter', name: 'Firefighter', salary: 88000, category: 'public',
    demandNote: 'Highly competitive entry — thousands apply for each posting. Strong union, pension, and benefits make it one of the most stable public sector careers.',
  },
  'police-officer': {
    id: 'police', name: 'Police Officer', salary: 92000, category: 'public',
    demandNote: 'Active hiring in Calgary (CPS) and Ottawa (OPS). Most forces require Canadian citizenship. Starting salary increases significantly after 3–5 years.',
  },
  'truck-driver': {
    id: 'truck_driver', name: 'Truck Driver', salary: 72000, category: 'trades',
    demandNote: 'Critical shortage. Long-haul routes between Alberta and BC are in highest demand. LMIA-exempt pathways available for experienced drivers.',
    licenseNote: 'Class 1/AZ licence required for long-haul. Road test and air brake endorsement needed.',
  },
  'commercial-pilot': {
    id: 'pilot', name: 'Commercial Pilot', salary: 145000, category: 'high-income',
    demandNote: 'Strong demand as aviation recovers post-pandemic. Cadet and direct-entry captain programs actively recruiting. Based at major hubs in Toronto and Vancouver.',
    licenseNote: 'Transport Canada CPL/ATPL required. Foreign licence conversion process available.',
  },
  'chef': {
    id: 'chef', name: 'Chef', salary: 52000, category: 'service',
    demandNote: 'High turnover industry. Executive chef and sous chef roles command a significant premium over line cook wages. Culinary arts credentials help in competitive cities.',
  },
  'retail-associate': {
    id: 'retail', name: 'Retail Associate', salary: 42000, category: 'service',
    demandNote: 'Entry-level access with no formal requirements. Limited upward mobility without a management track. Often used as a first job on arrival.',
  },
  'security-guard': {
    id: 'security', name: 'Security Guard', salary: 46000, category: 'service',
    demandNote: 'Steady demand. Government, airport, and corporate security positions pay notably more than retail. Supervisory roles available within 1–2 years.',
    licenseNote: 'Provincial security guard licence required (e.g., Security Guard Basic Licence in BC and Ontario).',
  },
  'cleaner': {
    id: 'cleaner', name: 'Cleaner / Janitor', salary: 40000, category: 'service',
    demandNote: 'Consistent demand. Commercial and government contracts offer better stability and hourly rates than residential cleaning.',
  },
}

// ── Cities ────────────────────────────────────────────────────────────────────
// benchmarkHpi = years to own 2BR condo at Canadian median salary (~$75K)
// avgRent2BR   = monthly rent CAD (2025/2026 market)
export const CITIES: Record<string, CityData> = {
  'vancouver': {
    name: 'Vancouver', displayName: 'Vancouver', province: 'British Columbia',
    benchmarkHpi: 16.2, avgRent2BR: 3100,
    taxNote: 'BC has a 5.06%–20.5% provincial income tax and 7% PST on goods.',
    sectorNote: 'Tech (Amazon, Microsoft, EA, Capcom), film and TV production, and port/logistics drive Vancouver\'s economy.',
    immigrantNote: 'Canada\'s largest Chinese-speaking community outside China. Strong Cantonese and Mandarin services across healthcare, finance, and real estate.',
  },
  'toronto': {
    name: 'Toronto', displayName: 'Toronto', province: 'Ontario',
    benchmarkHpi: 15.1, avgRent2BR: 2850,
    taxNote: 'Ontario has a 5.05%–13.16% provincial income tax and HST of 13%.',
    sectorNote: 'Canada\'s financial capital. Strong in finance, consulting, tech, and media. Most diverse job market nationally.',
    immigrantNote: 'Most diverse city in Canada. Large South Asian, Chinese, and Filipino communities with extensive settlement support.',
  },
  'calgary': {
    name: 'Calgary', displayName: 'Calgary', province: 'Alberta',
    benchmarkHpi: 8.5, avgRent2BR: 1900,
    taxNote: 'Alberta has NO provincial income tax and NO PST — saving $5,000–$15,000/yr versus BC or Ontario at equivalent salaries.',
    sectorNote: 'Energy sector, construction, tech (rapidly growing), and agriculture. Highest average household income of any major Canadian city.',
    immigrantNote: 'Fastest-growing immigrant population in Canada. Active federal and provincial nomination streams. Large Filipino, South Asian, and Chinese communities.',
  },
  'montreal': {
    name: 'Montreal', displayName: 'Montréal', province: 'Quebec',
    benchmarkHpi: 10.0, avgRent2BR: 1950,
    taxNote: 'Quebec has the highest combined provincial income tax in Canada (up to 25.75%). Offset by subsidized daycare ($10/day) and lower tuition.',
    sectorNote: 'AI research hub (Mila, Element AI), aerospace (Bombardier, CAE), gaming (Ubisoft), and bilingual business services.',
    immigrantNote: 'French language proficiency is a practical requirement for most employment outside anglophone sectors. Bill 96 strengthens French requirements.',
  },
  'ottawa': {
    name: 'Ottawa', displayName: 'Ottawa', province: 'Ontario',
    benchmarkHpi: 9.8, avgRent2BR: 2100,
    taxNote: 'Ontario provincial income tax applies. More affordable than Toronto with similar tax structure.',
    sectorNote: 'Federal public service is the dominant employer. Growing tech sector (Shopify HQ, Invest Ottawa). Stable, government-anchored economy.',
    immigrantNote: 'Strong settlement infrastructure due to federal government presence. Less intense competition for housing than Toronto.',
  },
}

// ── Calculations ──────────────────────────────────────────────────────────────
const MEDIAN_SALARY = 75000

export function calcHpiYears(occSlug: string, citySlug: string): number {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return 0
  return Math.round(city.benchmarkHpi * (MEDIAN_SALARY / occ.salary) * 10) / 10
}

export function calcRpi(occSlug: string, citySlug: string): number {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return 0
  return Math.round((city.avgRent2BR * 12 / occ.salary) * 100 * 10) / 10
}

export function hpiLabel(years: number): { text: string; color: string } {
  if (years < 7)  return { text: 'Highly Affordable', color: '#14B8A6' }
  if (years < 11) return { text: 'Manageable',        color: '#F59E0B' }
  if (years < 15) return { text: 'Challenging',       color: '#E86C2F' }
  return             { text: 'Very Difficult',         color: '#EF4444' }
}

export function rpiLabel(rpi: number): { text: string; color: string } {
  if (rpi < 28) return { text: 'Healthy',   color: '#14B8A6' }
  if (rpi < 35) return { text: 'Moderate',  color: '#F59E0B' }
  if (rpi < 42) return { text: 'High',      color: '#E86C2F' }
  return           { text: 'Very High',     color: '#EF4444' }
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

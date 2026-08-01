import Link from 'next/link'
import { LakiveLogo } from '../../components/LakiveLogo'

export const metadata = {
  title: 'Education & Licensing in Canada | Lakive',
  description: 'Official regulatory bodies for regulated professions across BC, ON, AB, and QC. An index of licensing authorities — not procedural guidance.',
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PROVINCES = ['BC', 'ON', 'AB', 'QC']

interface Body { name: string; url: string }

interface OccRow {
  slug: string
  label: string
  bodies: { BC: Body; ON: Body; AB: Body; QC: Body }
  note?: string
}

const HEALTHCARE: OccRow[] = [
  {
    slug: 'registered-nurse',
    label: 'Registered Nurse',
    bodies: {
      BC: { name: 'BCCNM',    url: 'https://www.bccnm.ca' },
      ON: { name: 'CNO',      url: 'https://www.cno.org' },
      AB: { name: 'CARNA',   url: 'https://www.nurses.ab.ca' },
      QC: { name: 'OIIQ',    url: 'https://www.oiiq.org' },
    },
  },
  {
    slug: 'family-physician',
    label: 'Family Physician',
    bodies: {
      BC: { name: 'CPSBC',   url: 'https://www.cpsbc.ca' },
      ON: { name: 'CPSO',    url: 'https://www.cpso.on.ca' },
      AB: { name: 'CPSA',    url: 'https://cpsa.ca' },
      QC: { name: 'CMQ',     url: 'https://www.cmq.org' },
    },
  },
  {
    slug: 'pharmacist',
    label: 'Pharmacist',
    bodies: {
      BC: { name: 'CPBC',    url: 'https://www.bcpharmacists.org' },
      ON: { name: 'OCP',     url: 'https://www.ocpinfo.com' },
      AB: { name: 'ACP',     url: 'https://pharmacists.ab.ca' },
      QC: { name: 'OPQ',     url: 'https://www.opq.org' },
    },
  },
  {
    slug: 'dentist',
    label: 'Dentist',
    bodies: {
      BC: { name: 'CDSBC',   url: 'https://www.cdsbc.org' },
      ON: { name: 'RCDSO',   url: 'https://www.rcdso.org' },
      AB: { name: 'CAD',     url: 'https://www.collegeofalbertagentists.ca' },
      QC: { name: 'ODQ',     url: 'https://www.odq.qc.ca' },
    },
  },
  {
    slug: 'social-worker',
    label: 'Social Worker',
    bodies: {
      BC: { name: 'BCCSW',      url: 'https://www.bccollegeofsocialworkers.ca' },
      ON: { name: 'OCSWSSW',    url: 'https://www.ocswssw.org' },
      AB: { name: 'ACSW',       url: 'https://www.acsw.ab.ca' },
      QC: { name: 'OTSTCFQ',   url: 'https://www.otstcfq.org' },
    },
  },
]

const PROFESSIONAL: OccRow[] = [
  {
    slug: 'civil-engineer',
    label: 'Civil Engineer',
    bodies: {
      BC: { name: 'EGBC',    url: 'https://www.egbc.ca' },
      ON: { name: 'PEO',     url: 'https://peo.on.ca' },
      AB: { name: 'APEGA',   url: 'https://www.apega.ca' },
      QC: { name: 'OIQ',     url: 'https://www.oiq.qc.ca' },
    },
    note: 'P.Eng designation required to practise as a licensed engineer. Software Engineers may also apply.',
  },
  {
    slug: 'lawyer',
    label: 'Lawyer',
    bodies: {
      BC: { name: 'LSBC',            url: 'https://www.lawsociety.bc.ca' },
      ON: { name: 'LSO',             url: 'https://lso.ca' },
      AB: { name: 'LSA',             url: 'https://www.lawsociety.ab.ca' },
      QC: { name: 'Barreau du QC',   url: 'https://www.barreau.qc.ca' },
    },
    note: 'Foreign-trained lawyers must complete NCA (National Committee on Accreditation) assessment before applying to a provincial law society.',
  },
  {
    slug: 'accountant',
    label: 'Accountant (CPA)',
    bodies: {
      BC: { name: 'CPABC',       url: 'https://www.bccpa.ca' },
      ON: { name: 'CPA Ontario', url: 'https://www.cpaontario.ca' },
      AB: { name: 'CPA Alberta', url: 'https://www.cpaalberta.ca' },
      QC: { name: 'CPA Québec',  url: 'https://cpaquebec.ca' },
    },
    note: 'CPA designation is not legally required for all accounting roles, but is standard for senior positions.',
  },
  {
    slug: 'financial-advisor',
    label: 'Financial Advisor',
    bodies: {
      BC: { name: 'BCFSA',  url: 'https://www.bcfsa.ca' },
      ON: { name: 'FSRA',   url: 'https://www.fsrao.ca' },
      AB: { name: 'ASC',    url: 'https://www.albertasecurities.com' },
      QC: { name: 'AMF',    url: 'https://lautorite.qc.ca' },
    },
    note: 'Regulation varies by product type (insurance, securities, mutual funds). CIRO (formerly IIROC/MFDA) regulates investment dealers nationally.',
  },
  {
    slug: 'real-estate-agent',
    label: 'Real Estate Agent',
    bodies: {
      BC: { name: 'BCFSA',  url: 'https://www.bcfsa.ca' },
      ON: { name: 'RECO',   url: 'https://www.reco.on.ca' },
      AB: { name: 'RECA',   url: 'https://www.reca.ca' },
      QC: { name: 'OACIQ',  url: 'https://www.oaciq.com' },
    },
  },
]

const EDUCATION_PUBLIC: OccRow[] = [
  {
    slug: 'secondary-teacher',
    label: 'Secondary Teacher',
    bodies: {
      BC: { name: 'TRB',              url: 'https://www.bcteacherregulation.ca' },
      ON: { name: 'OCT',              url: 'https://www.oct.ca' },
      AB: { name: 'Alberta Education', url: 'https://www.alberta.ca/teacher-certification' },
      QC: { name: 'MEES',             url: 'https://www.quebec.ca/education/enseignement-primaire-secondaire' },
    },
    note: 'Foreign-trained teachers typically need an ECA plus a provincial equivalency review. Quebec requires French proficiency.',
  },
  {
    slug: 'police-officer',
    label: 'Police Officer',
    bodies: {
      BC: { name: 'JIBC',                url: 'https://www.jibc.ca/programs-courses/police' },
      ON: { name: 'Ontario Police College', url: 'https://www.mcscs.jus.gov.on.ca/english/police_serv/OntarioPolicecollege/OPC.html' },
      AB: { name: 'Alberta Justice',     url: 'https://www.alberta.ca/police-services' },
      QC: { name: 'ENSP',               url: 'https://www.ensp.gouv.qc.ca' },
    },
    note: 'Recruitment is conducted by individual police services (municipal, RCMP detachment). Provincial training is typically required post-hire.',
  },
  {
    slug: 'security-guard',
    label: 'Security Guard',
    bodies: {
      BC: { name: 'Security Programs BC',   url: 'https://www2.gov.bc.ca/gov/content/employment-business/business/security-services' },
      ON: { name: 'PSISA / MSGCS',          url: 'https://www.ontario.ca/page/get-security-guard-licence' },
      AB: { name: 'Service Alberta',        url: 'https://www.alberta.ca/security-services-licensing.aspx' },
      QC: { name: 'BSP',                    url: 'https://www.bsp.gouv.qc.ca' },
    },
  },
]

interface TradeRow {
  slug: string
  label: string
  redSeal: boolean
  bodies: { BC: Body; ON: Body; AB: Body; QC: Body }
}

const TRADES: TradeRow[] = [
  {
    slug: 'electrician', label: 'Electrician', redSeal: true,
    bodies: {
      BC: { name: 'ITA BC',                  url: 'https://www.itabc.ca' },
      ON: { name: 'Skilled Trades Ontario',  url: 'https://www.skilledtradesontario.ca' },
      AB: { name: 'Alberta Apprenticeship',  url: 'https://www.alberta.ca/apprenticeship' },
      QC: { name: 'CCQ',                     url: 'https://www.ccq.org' },
    },
  },
  {
    slug: 'plumber', label: 'Plumber', redSeal: true,
    bodies: {
      BC: { name: 'ITA BC',                  url: 'https://www.itabc.ca' },
      ON: { name: 'Skilled Trades Ontario',  url: 'https://www.skilledtradesontario.ca' },
      AB: { name: 'Alberta Apprenticeship',  url: 'https://www.alberta.ca/apprenticeship' },
      QC: { name: 'CCQ',                     url: 'https://www.ccq.org' },
    },
  },
  {
    slug: 'carpenter', label: 'Carpenter', redSeal: true,
    bodies: {
      BC: { name: 'ITA BC',                  url: 'https://www.itabc.ca' },
      ON: { name: 'Skilled Trades Ontario',  url: 'https://www.skilledtradesontario.ca' },
      AB: { name: 'Alberta Apprenticeship',  url: 'https://www.alberta.ca/apprenticeship' },
      QC: { name: 'CCQ',                     url: 'https://www.ccq.org' },
    },
  },
  {
    slug: 'welder', label: 'Welder', redSeal: true,
    bodies: {
      BC: { name: 'ITA BC',                  url: 'https://www.itabc.ca' },
      ON: { name: 'Skilled Trades Ontario',  url: 'https://www.skilledtradesontario.ca' },
      AB: { name: 'Alberta Apprenticeship',  url: 'https://www.alberta.ca/apprenticeship' },
      QC: { name: 'CCQ',                     url: 'https://www.ccq.org' },
    },
  },
  {
    slug: 'auto-mechanic', label: 'Auto Mechanic', redSeal: true,
    bodies: {
      BC: { name: 'ITA BC',                  url: 'https://www.itabc.ca' },
      ON: { name: 'Skilled Trades Ontario',  url: 'https://www.skilledtradesontario.ca' },
      AB: { name: 'Alberta Apprenticeship',  url: 'https://www.alberta.ca/apprenticeship' },
      QC: { name: 'CCQ',                     url: 'https://www.ccq.org' },
    },
  },
  {
    slug: 'truck-driver', label: 'Truck Driver (Class 1)', redSeal: false,
    bodies: {
      BC: { name: 'ICBC',                url: 'https://www.icbc.com/driver-licensing/getting-licensed' },
      ON: { name: 'MTO',                 url: 'https://www.ontario.ca/page/get-commercial-vehicle-operators-registration' },
      AB: { name: 'Alberta Transport',   url: 'https://www.alberta.ca/commercial-vehicle-operator-registration.aspx' },
      QC: { name: 'SAAQ',               url: 'https://saaq.gouv.qc.ca/en/licences/heavy-vehicle-driver-licences' },
    },
  },
]

const FEDERAL = [
  {
    slug: 'commercial-pilot',
    label: 'Commercial Pilot',
    body: 'Transport Canada — Civil Aviation',
    url: 'https://tc.canada.ca/en/aviation/civil-aviation',
    note: 'Federal regulation applies uniformly across all provinces. Foreign pilot licences may be converted via TCCA validation.',
  },
]

const NOT_REGULATED = [
  { slug: 'software-engineer',    label: 'Software Engineer',    note: 'P.Eng (Professional Engineer) designation is optional via provincial engineering bodies.' },
  { slug: 'data-analyst',         label: 'Data Analyst',         note: 'No specific licence required.' },
  { slug: 'it-support',           label: 'IT Support',           note: 'No specific licence required.' },
  { slug: 'marketing-specialist', label: 'Marketing Specialist', note: 'No specific licence required.' },
  { slug: 'hr-specialist',        label: 'HR Specialist',        note: 'CPHR designation (Chartered Professional in Human Resources) is optional.' },
  { slug: 'chef',                 label: 'Chef / Cook',          note: 'Food Safe certification required (provincial). Red Seal Cook certification available.' },
  { slug: 'construction-worker',  label: 'Construction Worker',  note: 'No trade licence required; WorkSafeBC/WSIB safety training typically required on site.' },
  { slug: 'firefighter',          label: 'Firefighter',          note: 'Hired directly by municipal fire departments. Requirements vary by municipality.' },
  { slug: 'retail-associate',     label: 'Retail Associate',     note: 'No specific licence required.' },
  { slug: 'cleaner',              label: 'Cleaner',              note: 'No specific licence required.' },
]

// ── Shared styles ─────────────────────────────────────────────────────────────
const th: React.CSSProperties = {
  padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontSize: 13, color: 'rgba(255,255,255,0.65)',
  borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top',
}
const tdOcc: React.CSSProperties = { ...td, fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }

function BodyCell({ body }: { body: Body }) {
  return (
    <td style={td}>
      <a href={body.url} target="_blank" rel="noopener noreferrer"
        style={{ color: '#14B8A6', textDecoration: 'none', fontWeight: 500 }}>
        {body.name}
      </a>
    </td>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{desc}</p>
    </div>
  )
}

function OccTable({ rows }: { rows: OccRow[] }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 40 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
            <th style={th}>Occupation</th>
            {PROVINCES.map(p => <th key={p} style={{ ...th, textAlign: 'center' }}>{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.slug}>
                <td style={tdOcc}>
                  <Link href={`/guide/${row.slug}/vancouver`}
                    style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                    {row.label}
                  </Link>
                </td>
                {PROVINCES.map(p => <BodyCell key={p} body={row.bodies[p as keyof typeof row.bodies]} />)}
              </tr>
              {row.note && (
                <tr key={`${row.slug}-note`}>
                  <td colSpan={5} style={{ ...td, fontSize: 11, color: 'rgba(255,255,255,0.28)', paddingTop: 4, paddingBottom: 12, fontStyle: 'italic' }}>
                    ⓘ {row.note}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EducationLicensingPage() {
  return (
    <div style={{ background: '#080c14', minHeight: '100vh', color: 'white' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Logo + breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <LakiveLogo size={20} theme="dark" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Link href="/guide" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, textDecoration: 'none' }}>Guides</Link>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12 }}>Education & Licensing</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            Education & Licensing in Canada
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 660 }}>
            Canada's regulated professions are governed at the provincial level. This page is an index of official regulatory bodies — not procedural guidance. Always verify requirements directly with the relevant authority, as processes change.
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(232,108,47,0.08)', border: '1px solid rgba(232,108,47,0.20)', borderRadius: 10, padding: '14px 18px', marginBottom: 40, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Licensing requirements vary by province, change over time, and depend on your specific credentials and country of origin. The links below go to official regulatory bodies — do not rely on third-party summaries (including this page) for application decisions.
          </p>
        </div>

        {/* ── ECA Section ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <SectionHeader
            title="Foreign Credentials — Start Here"
            desc="Most regulated professions require an Educational Credential Assessment (ECA) before applying to a provincial body."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { name: 'WES Canada', note: 'Most widely accepted — immigration + professional', url: 'https://www.wes.org/ca' },
              { name: 'ICAS',       note: 'Accepted in most provinces',                        url: 'https://www.icascanada.ca' },
              { name: 'IQAS',       note: 'Alberta-specific ECA',                              url: 'https://www.alberta.ca/iqas.aspx' },
              { name: 'NCA',        note: 'Law graduates only (foreign-trained lawyers)',       url: 'https://flsc.ca/national-committee-on-accreditation-nca' },
            ].map(eca => (
              <a key={eca.name} href={eca.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', textDecoration: 'none' }}>
                <div style={{ color: '#14B8A6', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{eca.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{eca.note}</div>
              </a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            Note: Some regulatory bodies conduct their own credential assessment — check with the provincial body first to confirm which ECA they accept.
          </p>
        </div>

        {/* ── Healthcare ──────────────────────────────────────────────────── */}
        <SectionHeader title="Healthcare" desc="All healthcare professions in Canada are provincially regulated. Interprovincial mobility varies by profession." />
        <OccTable rows={HEALTHCARE} />

        {/* ── Professional ────────────────────────────────────────────────── */}
        <SectionHeader title="Professional & Financial" desc="Engineering, law, accounting, and financial services each have distinct regulatory frameworks." />
        <OccTable rows={PROFESSIONAL} />

        {/* ── Education & Public Safety ────────────────────────────────────── */}
        <SectionHeader title="Education & Public Safety" desc="Teacher certification and security licensing are provincially regulated; police recruitment is primarily municipal." />
        <OccTable rows={EDUCATION_PUBLIC} />

        {/* ── Skilled Trades ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 4 }}>Skilled Trades</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
            Most trades are compulsory in Quebec (CCQ) and voluntary in other provinces — though Red Seal certification enables interprovincial mobility everywhere.
          </p>
        </div>
        <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14 }}>🍁</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Red Seal Program — </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>A national standard that allows certified tradespeople to work in any province without re-examination. </span>
            <a href="https://www.canada.ca/en/employment-social-development/programs/apprenticeship/red-seal.html"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#14B8A6', textDecoration: 'none' }}>
              Red Seal Program →
            </a>
          </div>
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={th}>Trade</th>
                <th style={{ ...th, textAlign: 'center', width: 80 }}>Red Seal</th>
                {PROVINCES.map(p => <th key={p} style={{ ...th, textAlign: 'center' }}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {TRADES.map(row => (
                <tr key={row.slug}>
                  <td style={tdOcc}>
                    <Link href={`/guide/${row.slug}/calgary`}
                      style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                      {row.label}
                    </Link>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    {row.redSeal ? <span style={{ color: '#14B8A6', fontWeight: 700, fontSize: 12 }}>✓ Yes</span> : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>—</span>}
                  </td>
                  {PROVINCES.map(p => <BodyCell key={p} body={row.bodies[p as keyof typeof row.bodies]} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Federal ──────────────────────────────────────────────────────── */}
        <SectionHeader title="Federally Regulated" desc="Regulated by the Government of Canada — same requirements across all provinces." />
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={th}>Occupation</th>
                <th style={th}>Regulatory Body</th>
                <th style={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {FEDERAL.map(row => (
                <tr key={row.slug}>
                  <td style={tdOcc}>{row.label}</td>
                  <td style={td}>
                    <a href={row.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#14B8A6', textDecoration: 'none', fontWeight: 500 }}>
                      {row.body}
                    </a>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Not Regulated ────────────────────────────────────────────────── */}
        <SectionHeader
          title="Not Regulated by a Licensing Body"
          desc="These occupations do not require a provincial licence to practise. Employers may still require certifications, degrees, or background checks."
        />
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 48 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={th}>Occupation</th>
                <th style={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {NOT_REGULATED.map(row => (
                <tr key={row.slug}>
                  <td style={{ ...tdOcc, width: 220 }}>
                    <Link href={`/guide/${row.slug}/vancouver`}
                      style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                      {row.label}
                    </Link>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 1.7 }}>
            This index is provided for informational purposes only and does not constitute legal, immigration, or professional advice. Regulatory body names, URLs, and requirements are subject to change. Last reviewed: July 2026. Always consult the official regulatory body for current requirements.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <Link href="/guide" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← Back to Guides</Link>
            <Link href="/ranking" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>City Rankings →</Link>
          </div>
        </div>

      </main>
    </div>
  )
}

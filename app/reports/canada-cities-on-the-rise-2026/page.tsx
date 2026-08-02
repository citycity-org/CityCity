'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Data ──────────────────────────────────────────────────────────────────────

const CITIES = [
  {
    id: 'calgary', name: 'Calgary', color: '#EF4444', rank: 1,
    fitScore: 79, hpiYears: 5.9, rpi: 28, rent: '$1,950',
    province: 'Alberta', tax: 'No provincial income tax',
    eoiBreadth: 9, label: 'Trades & Healthcare Capital',
    bestFor: 'Trades workers, healthcare professionals, home ownership seekers',
    snap: ['#1 Healthcare · #1 Skilled Trades', 'Most affordable major city in Canada', 'No provincial income tax (saves $3K–$8K/yr)'],
    topOccupations: [
      { name: 'Family Physician', fit: 92, eoi: 'High' as const, hpi: 2.5 },
      { name: 'Electrician',       fit: 91, eoi: 'High' as const, hpi: 3.9 },
      { name: 'Registered Nurse',  fit: 86, eoi: 'High' as const, hpi: 4.5 },
      { name: 'Lawyer',            fit: 86, eoi: 'Mid'  as const, hpi: 4.2 },
      { name: 'Police Officer',    fit: 84, eoi: 'High' as const, hpi: 4.8 },
      { name: 'Civil Engineer',    fit: 82, eoi: 'High' as const, hpi: 6.0 },
    ],
    catch: 'Tech EOI registers Mid — Calgary\'s ecosystem is growing but still significantly smaller than Toronto or Vancouver. Transit infrastructure also trails.',
  },
  {
    id: 'ottawa', name: 'Ottawa', color: '#4F8EF7', rank: 2,
    fitScore: 72, hpiYears: 7.4, rpi: 31, rent: '$2,100',
    province: 'Ontario', tax: 'HST 13%',
    eoiBreadth: 7, label: 'The Underrated Career City',
    bestFor: 'Public sector, lawyers, nurses, tech workers',
    snap: ['#1 Education & Public Service', '#1 Quality of Life in Canada (Numbeo 2026)', 'Housing ~30% cheaper than Toronto, same province'],
    topOccupations: [
      { name: 'Family Physician',   fit: 88, eoi: 'High' as const, hpi: 3.0 },
      { name: 'Lawyer',             fit: 84, eoi: 'High' as const, hpi: 5.0 },
      { name: 'Registered Nurse',   fit: 82, eoi: 'High' as const, hpi: 6.5 },
      { name: 'Software Engineer',  fit: 80, eoi: 'High' as const, hpi: 6.2 },
      { name: 'Secondary Teacher',  fit: 80, eoi: 'High' as const, hpi: 7.0 },
      { name: 'Police Officer',     fit: 80, eoi: 'High' as const, hpi: 6.8 },
    ],
    catch: 'Private sector is smaller than government presence — fewer startup and entrepreneurial opportunities. Fewer international connections than Toronto, Vancouver, or Montréal.',
  },
  {
    id: 'toronto', name: 'Toronto', color: '#F59E0B', rank: 3,
    fitScore: 65, hpiYears: 10.5, rpi: 43, rent: '$2,750',
    province: 'Ontario', tax: 'HST 13%',
    eoiBreadth: 15, label: 'Opportunity Capital, At a Price',
    bestFor: 'Senior physicians, lawyers, software engineers, finance professionals',
    snap: ['15 of 20 occupations register High EOI', '#1 Legal & Finance in Canada', 'Housing affordability at a generational low'],
    topOccupations: [
      { name: 'Software Engineer', fit: 88, eoi: 'High' as const, hpi: 9.2  },
      { name: 'Family Physician', fit: 86, eoi: 'High' as const, hpi: 4.5  },
      { name: 'Lawyer',           fit: 82, eoi: 'High' as const, hpi: 7.6  },
      { name: 'Accountant',       fit: 72, eoi: 'High' as const, hpi: 13.8 },
      { name: 'Registered Nurse', fit: 72, eoi: 'High' as const, hpi: 12.0 },
      { name: 'Electrician',      fit: 70, eoi: 'High' as const, hpi: 12.5 },
    ],
    catch: 'For workers outside the top income quartile: strong career options, severely limited financial advancement. A nurse needs 12 years of full gross income to buy a median home. An accountant, 13.8 years.',
  },
  {
    id: 'vancouver', name: 'Vancouver', color: '#E86C2F', rank: 4,
    fitScore: 64, hpiYears: 11.4, rpi: 41, rent: '$2,950',
    province: 'British Columbia', tax: 'GST 5% + PST 7%',
    eoiBreadth: 5, label: 'Tech & Healthcare, At a Price',
    bestFor: 'Tech professionals and senior healthcare workers with long-term earning potential',
    snap: ['#1 Technology in Canada', 'EIU global top-10 livability (2026)', 'Highest rent-to-income ratio in Canada'],
    topOccupations: [
      { name: 'Software Engineer', fit: 84, eoi: 'High' as const, hpi: 9.5  },
      { name: 'Family Physician', fit: 82, eoi: 'High' as const, hpi: 5.5  },
      { name: 'Lawyer',           fit: 78, eoi: 'Mid'  as const, hpi: 8.1  },
      { name: 'Pharmacist',       fit: 74, eoi: 'Mid'  as const, hpi: 10.5 },
      { name: 'Data Analyst',     fit: 72, eoi: 'Mid'  as const, hpi: 11.5 },
      { name: 'Electrician',      fit: 72, eoi: 'High' as const, hpi: 13.0 },
    ],
    catch: 'Mid-income workers — teachers, IT support, mechanics, social workers — face stable employment but severely limited financial advancement. Housing scores among the most stressed globally.',
  },
  {
    id: 'montreal', name: 'Montréal', color: '#14B8A6', rank: 5,
    fitScore: 62, hpiYears: 6.5, rpi: 30, rent: '$1,850',
    province: 'Québec', tax: 'GST + QST ≈15%',
    eoiBreadth: 0, label: 'Affordability, Culture & Rising Economy',
    bestFor: 'AI researchers, game developers, aerospace engineers, creative industries',
    snap: ['Top-3 global aerospace cluster (with Seattle & Toulouse)', 'Global AI hub — Mila Institute anchors Microsoft, Google, Meta labs', 'Most affordable major city in Canada by a meaningful margin'],
    topOccupations: [
      { name: 'Family Physician', fit: 78, eoi: 'Mid' as const, hpi: 2.6 },
      { name: 'Lawyer',           fit: 72, eoi: 'Mid' as const, hpi: 4.5 },
      { name: 'Software Engineer',fit: 70, eoi: 'Mid' as const, hpi: 5.2 },
      { name: 'Electrician',      fit: 68, eoi: 'Mid' as const, hpi: 5.5 },
      { name: 'Teacher',          fit: 68, eoi: 'Mid' as const, hpi: 5.8 },
      { name: 'Nurse',            fit: 65, eoi: 'Mid' as const, hpi: 6.0 },
    ],
    catch: 'French proficiency is functionally required in most professional environments. Quebec\'s combined tax burden (GST + QST ≈15% + high provincial income tax) offsets some housing affordability for higher earners.',
  },
]

// EOI Heatmap  [Calgary, Ottawa, Toronto, Vancouver, Montréal]
const OCCUPATIONS = [
  'Family Physician','Registered Nurse','Software Engineer','Electrician',
  'Lawyer','Accountant','Secondary Teacher','Truck Driver',
  'Civil Engineer','AI / Game Dev','Aerospace Engineer','Chef / Retail',
]
type EOILevel = 'H' | 'M' | 'L'
const EOI_GRID: EOILevel[][] = [
  ['H','H','H','H','M'],  // Family Physician      Cal:9 Ott:7 Tor:15 Van:5 Mtl:0
  ['H','H','H','H','M'],  // Registered Nurse
  ['M','H','H','H','M'],  // Software Engineer
  ['H','M','H','H','M'],  // Electrician
  ['M','H','H','M','M'],  // Lawyer
  ['H','H','H','M','M'],  // Accountant
  ['H','H','M','M','M'],  // Secondary Teacher
  ['H','M','H','M','M'],  // Truck Driver
  ['H','H','H','M','M'],  // Civil Engineer
  ['M','M','H','H','M'],  // AI / Game Dev
  ['H','M','M','L','M'],  // Aerospace Engineer
  ['H','M','M','M','M'],  // Chef / Retail
]

const CAREER_MATRIX = [
  { occ:'Family Physician',   best:'Calgary',  bestC:'#EF4444', runner:'Ottawa',    runC:'#4F8EF7', avoid:'Vancouver if finances matter — Calgary wins on both fit and affordability' },
  { occ:'Registered Nurse',   best:'Calgary',  bestC:'#EF4444', runner:'Ottawa',    runC:'#4F8EF7', avoid:'Toronto or Vancouver — housing affordability makes ownership near-impossible' },
  { occ:'Software Engineer',  best:'Vancouver',bestC:'#E86C2F', runner:'Toronto',   runC:'#F59E0B', avoid:'If home ownership in <7 years is the goal → Ottawa or Calgary' },
  { occ:'Electrician',        best:'Calgary',  bestC:'#EF4444', runner:'Ottawa',    runC:'#4F8EF7', avoid:'Coastal cities — expect severe housing pressure relative to income' },
  { occ:'Lawyer',             best:'Toronto',  bestC:'#F59E0B', runner:'Ottawa',    runC:'#4F8EF7', avoid:'If mid-career + affordability priority → Calgary offers better net outcome' },
  { occ:'Accountant',         best:'Toronto',  bestC:'#F59E0B', runner:'Ottawa',    runC:'#4F8EF7', avoid:'If housing is a priority → Calgary' },
  { occ:'Secondary Teacher',  best:'Ottawa',   bestC:'#4F8EF7', runner:'Calgary',   runC:'#EF4444', avoid:'Montréal unless French-fluent; Vancouver for housing-to-income ratio' },
  { occ:'Truck Driver',       best:'Calgary',  bestC:'#EF4444', runner:'Toronto',   runC:'#F59E0B', avoid:'—' },
  { occ:'Civil Engineer',     best:'Calgary',  bestC:'#EF4444', runner:'Ottawa',    runC:'#4F8EF7', avoid:'—' },
  { occ:'AI / Game Dev',      best:'Montréal', bestC:'#14B8A6', runner:'Vancouver', runC:'#E86C2F', avoid:'If High EOI breadth is critical → Toronto or Vancouver' },
  { occ:'Aerospace Engineer', best:'Montréal', bestC:'#14B8A6', runner:'Toronto',   runC:'#F59E0B', avoid:'—' },
  { occ:'Chef / Retail',      best:'Montréal', bestC:'#14B8A6', runner:'Calgary',   runC:'#EF4444', avoid:'If High EOI urgency matters → go elsewhere' },
]

// ── Components ────────────────────────────────────────────────────────────────

function EOIBadge({ level }: { level: EOILevel }) {
  const s = {
    H: { bg:'#dcfce7', color:'#16a34a', text:'High' },
    M: { bg:'#fef9c3', color:'#ca8a04', text:'Mid'  },
    L: { bg:'#fee2e2', color:'#dc2626', text:'Low'  },
  }[level]
  return (
    <span style={{
      display:'inline-block', background:s.bg, color:s.color,
      fontSize:11, fontWeight:700, borderRadius:4, padding:'2px 7px',
    }}>{s.text}</span>
  )
}

function ScatterPlot() {
  const [hov, setHov] = useState<string|null>(null)
  const L=70,R=530,T=34,B=314
  const W=R-L, H=B-T
  const px = (h:number) => L+(h-2)/11*W
  const py = (f:number) => B-(f-55)/30*H
  const xTicks=[2,4,6,8,10,12], yTicks=[60,65,70,75,80,85]
  const labelOffset = (id:string) =>
    id==='calgary'?-28 : id==='ottawa'?-28 : id==='montreal'?34 : id==='toronto'?35 : 35

  return (
    <svg viewBox="0 0 600 388" style={{width:'100%', maxHeight:420}} role="img" aria-label="Scatter plot: City Fit Score vs HPI Years">
      {/* grid */}
      {xTicks.map(v=><line key={'xg'+v} x1={px(v)} y1={T} x2={px(v)} y2={B} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3"/>)}
      {yTicks.map(v=><line key={'yg'+v} x1={L} y1={py(v)} x2={R} y2={py(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3"/>)}
      {/* quadrant labels */}
      <text x={L+8} y={T+16} fontSize="9.5" fill="#d1d5db" fontStyle="italic">Affordable + High Fit ✦ Sweet Spot</text>
      <text x={R-8} y={T+16} fontSize="9.5" fill="#d1d5db" fontStyle="italic" textAnchor="end">Expensive + High Fit</text>
      <text x={L+8} y={B-6}  fontSize="9.5" fill="#d1d5db" fontStyle="italic">Affordable + Lower Fit</text>
      {/* axes */}
      <line x1={L} y1={B} x2={R} y2={B} stroke="#9ca3af" strokeWidth="1.5"/>
      <line x1={L} y1={T} x2={L} y2={B} stroke="#9ca3af" strokeWidth="1.5"/>
      {/* x ticks */}
      {xTicks.map(v=>(
        <g key={'xt'+v}>
          <line x1={px(v)} y1={B} x2={px(v)} y2={B+5} stroke="#9ca3af" strokeWidth="1"/>
          <text x={px(v)} y={B+17} textAnchor="middle" fontSize="10" fill="#6b7280">{v}</text>
        </g>
      ))}
      {/* y ticks */}
      {yTicks.map(v=>(
        <g key={'yt'+v}>
          <line x1={L-5} y1={py(v)} x2={L} y2={py(v)} stroke="#9ca3af" strokeWidth="1"/>
          <text x={L-8} y={py(v)+4} textAnchor="end" fontSize="10" fill="#6b7280">{v}</text>
        </g>
      ))}
      {/* axis labels */}
      <text x={(L+R)/2} y={362} textAnchor="middle" fontSize="11.5" fill="#374151" fontWeight="600">
        ← More Affordable · HPI Years (Home Price ÷ Salary) · More Expensive →
      </text>
      <text transform={`translate(13,${(T+B)/2}) rotate(-90)`} textAnchor="middle" fontSize="11.5" fill="#374151" fontWeight="600">
        City Fit Score →
      </text>
      {/* city bubbles */}
      {CITIES.map(c=>{
        const cx=px(c.hpiYears), cy=py(c.fitScore)
        const isH=hov===c.id, r=isH?22:18
        return (
          <g key={c.id} style={{cursor:'pointer'}}
            onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}>
            <circle cx={cx} cy={cy} r={r+6} fill="transparent"/>
            <circle cx={cx} cy={cy} r={r} fill={c.color} fillOpacity={isH?0.22:0.14}
              stroke={c.color} strokeWidth={isH?2.5:1.8} style={{transition:'all 0.15s'}}/>
            <text x={cx} y={cy-2} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c.color}>{c.fitScore}</text>
            <text x={cx} y={cy+9}  textAnchor="middle" fontSize="8"   fill={c.color} opacity="0.9">{c.hpiYears}yr</text>
            <text x={cx} y={cy+labelOffset(c.id)} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.color}>{c.name}</text>
            {isH && (
              <g>
                <rect x={cx+24} y={cy-28} width={130} height={52} rx="6" fill="#1e293b" opacity="0.92"/>
                <text x={cx+89} y={cy-13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{c.name}</text>
                <text x={cx+89} y={cy+2}  textAnchor="middle" fontSize="10" fill="#94a3b8">Fit: {c.fitScore} · HPI: {c.hpiYears} yr</text>
                <text x={cx+89} y={cy+15} textAnchor="middle" fontSize="10" fill="#94a3b8">RPI: {c.rpi}% · Rent: {c.rent}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function CityCard({ city }: { city: typeof CITIES[0] }) {
  return (
    <div style={{
      borderTop:`4px solid ${city.color}`, border:`1px solid #e5e7eb`,
      borderRadius:12, padding:'20px 18px', background:'#fff',
      borderTopWidth:4, borderTopStyle:'solid', borderTopColor:city.color,
    }}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
        <span style={{background:city.color,color:'#fff',fontWeight:800,fontSize:12,borderRadius:6,padding:'2px 8px'}}>#{city.rank}</span>
        <h3 style={{fontSize:17,fontWeight:800,color:city.color,margin:0}}>{city.name}</h3>
      </div>
      <p style={{fontSize:11.5,color:'#6b7280',margin:'0 0 14px',fontStyle:'italic'}}>{city.label}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {[
          {val:city.fitScore,label:'City Fit Score',color:city.color},
          {val:`${city.hpiYears} yr`,label:'Avg HPI Years',color:'#374151'},
          {val:`${city.rpi}%`,label:'Rent-to-Income',color:city.rpi>35?'#ef4444':'#374151'},
          {val:city.eoiBreadth,label:'High EOI Jobs',color:'#374151'},
        ].map(({val,label,color})=>(
          <div key={label} style={{background:'#f9fafb',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:22,fontWeight:800,color,lineHeight:1.1}}>{val}</div>
            <div style={{fontSize:11,color:'#6b7280',fontWeight:600,marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:'#6b7280',marginBottom:12}}>
        <div style={{marginBottom:3}}>📍 {city.province} · {city.tax}</div>
        <div>🏠 Median 2BR: {city.rent}/mo</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {city.snap.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:6}}>
            <span style={{color:city.color,fontSize:10,fontWeight:700,marginTop:2,flexShrink:0}}>▸</span>
            <span style={{fontSize:12,color:'#374151',lineHeight:1.5}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CityProfile({ city }: { city: typeof CITIES[0] }) {
  return (
    <div style={{marginBottom:28,border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
      <div style={{background:city.color,padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div>
          <h3 style={{color:'#fff',fontSize:18,fontWeight:800,margin:'0 0 4px'}}>
            #{city.rank} {city.name} — {city.label}
          </h3>
          <p style={{color:'rgba(255,255,255,0.85)',fontSize:12.5,margin:0}}>
            Best for: {city.bestFor}
          </p>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'#fff',fontSize:34,fontWeight:900,lineHeight:1}}>{city.fitScore}</div>
          <div style={{color:'rgba(255,255,255,0.75)',fontSize:11}}>City Fit Score</div>
        </div>
      </div>
      <div style={{padding:'16px 24px'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr>
              {['Occupation','Fit Score','EOI','HPI Years'].map((h,i)=>(
                <th key={h} style={{
                  textAlign: i===0?'left':'center', padding:'6px 8px',
                  color:'#6b7280',fontWeight:600,borderBottom:'1px solid #e5e7eb',fontSize:12,
                  ...(i===3?{textAlign:'right' as const}:{}),
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {city.topOccupations.map((occ,i)=>(
              <tr key={occ.name} style={{background:i%2===0?'#f9fafb':'#fff'}}>
                <td style={{padding:'8px',fontWeight:500,color:'#374151',borderBottom:'1px solid #f3f4f6'}}>{occ.name}</td>
                <td style={{padding:'8px',textAlign:'center',borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{position:'relative',background:'#e5e7eb',borderRadius:4,height:18,overflow:'hidden',minWidth:64,margin:'0 auto'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${occ.fit}%`,background:city.color,opacity:0.28}}/>
                    <span style={{position:'relative',fontSize:12,fontWeight:700,color:'#374151'}}>{occ.fit}</span>
                  </div>
                </td>
                <td style={{padding:'8px',textAlign:'center',borderBottom:'1px solid #f3f4f6'}}>
                  <EOIBadge level={occ.eoi==='High'?'H':occ.eoi==='Mid'?'M':'L'}/>
                </td>
                <td style={{padding:'8px',textAlign:'right',fontWeight:700,borderBottom:'1px solid #f3f4f6',
                  color:occ.hpi>9?'#dc2626':occ.hpi<4?'#16a34a':'#374151'}}>{occ.hpi} yr</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:12,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#92400e',lineHeight:1.6}}>
          <span style={{fontWeight:700}}>⚠ The catch: </span>{city.catch}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CanadaCitiesReport2026() {
  return (
    <main style={{fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",color:'#111827',maxWidth:900,margin:'0 auto',padding:'0 0 80px'}}>

      {/* COVER */}
      <div style={{background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1e4d3b 100%)',padding:'56px 40px 48px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-70,right:-70,width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,0.03)'}}/>
        <div style={{position:'absolute',bottom:-50,left:180,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.025)'}}/>
        <div style={{display:'flex',gap:10,marginBottom:22,flexWrap:'wrap',position:'relative'}}>
          {['LAKIVE RESEARCH','July 2026','H1 2026 Data'].map(t=>(
            <span key={t} style={{background:'rgba(255,255,255,0.1)',color:'#e2e8f0',fontSize:11.5,fontWeight:700,padding:'4px 12px',borderRadius:20,letterSpacing:'0.05em'}}>{t}</span>
          ))}
        </div>
        <h1 style={{color:'#fff',fontSize:40,fontWeight:900,lineHeight:1.1,margin:'0 0 10px',maxWidth:560,position:'relative'}}>
          Canada's Cities<br/>on the Rise 2026
        </h1>
        <p style={{color:'#94a3b8',fontSize:18,fontWeight:400,margin:'0 0 28px',position:'relative'}}>
          Beyond Job Growth: Where Can You Actually Build a Life?
        </p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:32,position:'relative'}}>
          {CITIES.map(c=>(
            <span key={c.id} style={{background:`${c.color}20`,border:`1.5px solid ${c.color}55`,color:c.color,fontSize:13,fontWeight:700,padding:'5px 14px',borderRadius:20}}>
              {c.name}
            </span>
          ))}
        </div>
        <div style={{display:'flex',gap:36,flexWrap:'wrap',position:'relative'}}>
          {[['5','Cities Analyzed'],['20','Occupations Tracked'],['3','Core Metrics'],['H1 2026','Data Period']].map(([v,l])=>(
            <div key={l}>
              <div style={{color:'#fff',fontSize:24,fontWeight:900,lineHeight:1}}>{v}</div>
              <div style={{color:'#64748b',fontSize:11.5,fontWeight:600,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'0 32px'}}>

        {/* KEY FINDINGS */}
        <div style={{background:'#f8fafc',borderLeft:'4px solid #3b82f6',padding:'22px 24px',margin:'36px 0'}}>
          <h2 style={{fontSize:13,fontWeight:800,color:'#374151',margin:'0 0 16px',textTransform:'uppercase',letterSpacing:'0.08em'}}>Key Findings at a Glance</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
            {[
              {color:'#EF4444',text:'Calgary leads Canada for trades & healthcare — strong hiring demand combined with the most affordable housing of any major city.'},
              {color:'#F59E0B',text:'Toronto offers the broadest opportunity (15/20 occupations High EOI) but housing accessibility has reached a generational low.'},
              {color:'#4F8EF7',text:'Ottawa punches above its size for public sector, legal, and healthcare workers — housing is ~30% cheaper than Toronto, same province.'},
              {color:'#E86C2F',text:'Vancouver remains the tech & senior healthcare destination, but its housing crisis increasingly limits who can realistically build wealth here.'},
              {color:'#14B8A6',text:'Montréal is Canada\'s value city — genuinely affordable and a rising global force in AI, gaming, and aerospace.'},
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:item.color,flexShrink:0,marginTop:5}}/>
                <span style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SCATTER PLOT */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>
            The Defining Chart: Affordability vs. Opportunity
          </h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 18px',lineHeight:1.6}}>
            City Fit Score (higher = better overall fit) vs. HPI Years (home price ÷ annual salary, lower = more affordable).
            {' '}<strong style={{color:'#374151'}}>The ideal quadrant is top-left.</strong>
            {' '}Hover over a city to see its full snapshot.
          </p>
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'20px 12px 12px'}}>
            <ScatterPlot/>
          </div>
          <div style={{marginTop:14,display:'flex',gap:12,alignItems:'flex-start',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'14px 18px'}}>
            <span style={{fontSize:18,flexShrink:0}}>📌</span>
            <p style={{margin:0,fontSize:13,color:'#1e40af',lineHeight:1.7}}>
              <strong>The affordability–opportunity gap is occupation-specific and widening.</strong> Calgary and Ottawa occupy the top-left sweet spot — strong fit, accessible housing. Toronto and Vancouver cluster bottom-right: exceptional opportunity depth, but a price most workers cannot sustain. Montréal breaks the pattern: affordable like Calgary, but with structurally lower employment breadth.
            </p>
          </div>
          <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <a href="/reports/pdf/Lakive_Canada_Cities_on_the_Rise_2026.pdf" download
              style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,
                color:'#374151',textDecoration:'none',background:'#f3f4f6',
                border:'1px solid #e5e7eb',borderRadius:8,padding:'6px 14px'}}>
              ↓ Download PDF
            </a>
            <Link href="/ranking" style={{fontSize:13,fontWeight:700,color:'#4F8EF7',textDecoration:'none'}}>
              See full occupation ranking across all cities →
            </Link>
          </div>
        </div>

        {/* LAKIVE INSIGHTS */}
        <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderRadius:14,padding:'30px 28px',margin:'44px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:22}}>
            <span style={{fontSize:18}}>💡</span>
            <h2 style={{color:'#fff',fontSize:18,fontWeight:800,margin:0}}>Lakive Insight: Three Things the Data Reveals</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
            {[
              {num:'01',color:'#EF4444',title:'The affordability–opportunity gap is occupation-specific.',body:'Nurses, electricians, and teachers in Toronto face structural barriers, not headwinds. Calgary and Ottawa now offer a better financial outcome for the majority of working Canadians.'},
              {num:'02',color:'#4F8EF7',title:'Your occupation matters more than your city.',body:'A software engineer and an electrician live in fundamentally different cities even when they share a postal code. Aggregate city rankings miss this entirely.'},
              {num:'03',color:'#14B8A6',title:'The coastal premium is no longer self-evident.',body:'For most occupations outside top-tier tech and finance, moving from Calgary or Ottawa to Vancouver or Toronto means paying significantly more to earn marginally more — or nothing more at all.'},
            ].map(item=>(
              <div key={item.num} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'18px 16px',borderTop:`3px solid ${item.color}`}}>
                <div style={{color:item.color,fontSize:28,fontWeight:900,lineHeight:1,marginBottom:8}}>{item.num}</div>
                <h4 style={{color:'#fff',fontSize:13.5,fontWeight:700,margin:'0 0 8px',lineHeight:1.4}}>{item.title}</h4>
                <p style={{color:'#94a3b8',fontSize:12.5,margin:0,lineHeight:1.65}}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CITY CARDS */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>City Snapshots</h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 20px'}}>National rankings by overall City Fit Score — all occupations averaged.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
            {CITIES.map(c=><CityCard key={c.id} city={c}/>)}
          </div>
        </div>

        {/* EOI HEATMAP */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>Employment Opportunity Index — by Occupation</h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 18px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            Which city is actively hiring in your field?
            <span style={{display:'inline-flex',gap:8}}>
              {([['H','#dcfce7','#16a34a','High'],['M','#fef9c3','#ca8a04','Mid'],['L','#fee2e2','#dc2626','Low']] as const).map(([,bg,color,text])=>(
                <span key={text} style={{background:bg,color,fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:4}}>{text}</span>
              ))}
            </span>
          </p>
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left',padding:'10px 16px',fontWeight:700,color:'#374151',borderBottom:'2px solid #e5e7eb',width:190,whiteSpace:'nowrap'}}>Occupation</th>
                    {CITIES.map(c=>(
                      <th key={c.id} style={{textAlign:'center',padding:'10px 8px',fontWeight:800,color:c.color,borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap',fontSize:12.5}}>
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OCCUPATIONS.map((occ,oi)=>(
                    <tr key={occ} style={{background:oi%2===0?'#f9fafb':'#fff'}}>
                      <td style={{padding:'8px 16px',fontWeight:500,color:'#374151',borderBottom:'1px solid #f3f4f6',whiteSpace:'nowrap'}}>{occ}</td>
                      {EOI_GRID[oi].map((level,ci)=>(
                        <td key={ci} style={{textAlign:'center',padding:'8px 6px',borderBottom:'1px solid #f3f4f6'}}>
                          <EOIBadge level={level}/>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{marginTop:14,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:'#6b7280'}}>Your occupation not listed?</span>
            <Link href="/ranking" style={{fontSize:13,fontWeight:700,color:'#4F8EF7',textDecoration:'none',background:'#eff6ff',padding:'5px 14px',borderRadius:20}}>
              Browse full occupation ranking →
            </Link>
            <Link href="/calculate" style={{fontSize:13,fontWeight:700,color:'#059669',textDecoration:'none',background:'#ecfdf5',padding:'5px 14px',borderRadius:20}}>
              Calculate my personal city fit →
            </Link>
          </div>
          <p style={{fontSize:11.5,color:'#9ca3af',marginTop:10}}>
            High = strong demand, multiple employers competing. Mid = steady demand, moderate competition. Low = oversupply or structural barriers.
          </p>
        </div>

        {/* CITY PROFILES */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>City Profiles</h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 24px'}}>Occupation-level Fit Scores, EOI, and housing pressure — by city.</p>
          {CITIES.map(c=><CityProfile key={c.id} city={c}/>)}
        </div>

        {/* SECTOR WINNERS */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>Which City Wins by Sector</h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 20px'}}>Sector-by-sector rankings across six major industry groups.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
            {[
              {sector:'🏥 Healthcare',
               rankings:[['#1','Calgary','#EF4444'],['#2','Ottawa','#4F8EF7'],['#3','Toronto','#F59E0B']],
               note:'Highest EOI breadth + fastest path to home ownership for physicians and nurses.'},
              {sector:'💻 Technology',
               rankings:[['#1','Vancouver','#E86C2F'],['#2','Toronto','#F59E0B'],['#3','Montréal','#14B8A6']],
               note:'Deepest ecosystem; Montréal compelling for AI/gaming roles where affordability amplifies the package.'},
              {sector:'🔧 Skilled Trades',
               rankings:[['#1','Calgary','#EF4444'],['#2','Ottawa','#4F8EF7'],['#3','Vancouver','#E86C2F']],
               note:'Calgary dominates on every metric: EOI, HPI Years, rent pressure, and fit score.'},
              {sector:'⚖️ Legal & Finance',
               rankings:[['#1','Toronto','#F59E0B'],['#2','Ottawa','#4F8EF7'],['#3','Calgary','#EF4444']],
               note:"Canada's financial and legal capital; Ottawa strong on federal legal and regulatory demand."},
              {sector:'📚 Education & Public Service',
               rankings:[['#1','Ottawa','#4F8EF7'],['#2','Calgary','#EF4444'],['#3','Montréal','#14B8A6']],
               note:'Federal employment anchors Ottawa; Calgary population growth drives new schools and services.'},
              {sector:'✈️ Aerospace',
               rankings:[['#1','Montréal','#14B8A6'],['#2','Toronto','#F59E0B'],['#3','Calgary','#EF4444']],
               note:'Top-3 aerospace cluster globally — Bombardier, Pratt & Whitney, CAE, Bell Textron. Alongside Seattle and Toulouse.'},
            ].map(({sector,rankings,note})=>(
              <div key={sector} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,padding:'16px 18px'}}>
                <h4 style={{fontSize:14,fontWeight:800,color:'#111827',margin:'0 0 12px'}}>{sector}</h4>
                <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:10}}>
                  {rankings.map(([rank,city,color])=>(
                    <div key={city} style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:'#9ca3af',fontSize:12,fontWeight:700,width:22}}>{rank}</span>
                      <span style={{color,fontWeight:700,fontSize:13}}>{city}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:12,color:'#6b7280',margin:0,lineHeight:1.55}}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CAREER MOVE MATRIX */}
        <div style={{margin:'44px 0'}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>The Career Move Matrix</h2>
          <p style={{color:'#6b7280',fontSize:14,margin:'0 0 20px'}}>Where should you go in 2026? A quick-reference guide by occupation.</p>
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#f8fafc'}}>
                    <th style={{textAlign:'left',padding:'12px 16px',fontWeight:700,color:'#374151',borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap'}}>Your Occupation</th>
                    <th style={{textAlign:'center',padding:'12px 12px',fontWeight:700,color:'#374151',borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap'}}>Best City</th>
                    <th style={{textAlign:'center',padding:'12px 12px',fontWeight:700,color:'#374151',borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap'}}>Runner-Up</th>
                    <th style={{textAlign:'left',padding:'12px 16px',fontWeight:700,color:'#374151',borderBottom:'2px solid #e5e7eb'}}>Avoid If…</th>
                  </tr>
                </thead>
                <tbody>
                  {CAREER_MATRIX.map((row,i)=>(
                    <tr key={row.occ} style={{background:i%2===0?'#f9fafb':'#fff'}}>
                      <td style={{padding:'10px 16px',fontWeight:600,color:'#374151',borderBottom:'1px solid #f3f4f6',whiteSpace:'nowrap'}}>{row.occ}</td>
                      <td style={{padding:'10px',textAlign:'center',borderBottom:'1px solid #f3f4f6'}}>
                        <span style={{background:`${row.bestC}18`,color:row.bestC,fontWeight:700,fontSize:12,padding:'3px 12px',borderRadius:20,whiteSpace:'nowrap'}}>{row.best}</span>
                      </td>
                      <td style={{padding:'10px',textAlign:'center',borderBottom:'1px solid #f3f4f6'}}>
                        <span style={{background:`${row.runC}18`,color:row.runC,fontWeight:700,fontSize:12,padding:'3px 12px',borderRadius:20,whiteSpace:'nowrap'}}>{row.runner}</span>
                      </td>
                      <td style={{padding:'10px 16px',color:'#6b7280',fontSize:12,borderBottom:'1px solid #f3f4f6',lineHeight:1.5}}>{row.avoid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* EXPLORE CTA */}
        <div style={{margin:'44px 0',background:'linear-gradient(135deg,#f8faff,#f0fdf4)',border:'1px solid #e5e7eb',borderRadius:16,padding:'32px 28px'}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <h2 style={{fontSize:20,fontWeight:800,color:'#111827',margin:'0 0 6px'}}>Explore the Data Yourself</h2>
            <p style={{fontSize:14,color:'#6b7280',margin:0}}>The report tells the story. The tools let you run the numbers for your own situation.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            {[
              {href:'/calculate',emoji:'🧮',label:'Calculate My City Fit',sub:'Enter your occupation, income & city',color:'#4F8EF7',bg:'#eff6ff',border:'#bfdbfe'},
              {href:'/compare',emoji:'⚖️',label:'Compare Two Cities',sub:'Side-by-side across all metrics',color:'#059669',bg:'#ecfdf5',border:'#6ee7b7'},
              {href:'/ranking',emoji:'🏆',label:'Full Occupation Ranking',sub:'All 20 occupations across 5 cities',color:'#d97706',bg:'#fffbeb',border:'#fde68a'},
              {href:'/guide/rent-vs-own',emoji:'🏠',label:'Rent vs Own',sub:'Year-by-year breakeven by city',color:'#7c3aed',bg:'#f5f3ff',border:'#c4b5fd'},
            ].map(({href,emoji,label,sub,color,bg,border})=>(
              <Link key={href} href={href} style={{
                display:'block',textDecoration:'none',
                background:bg,border:`1px solid ${border}`,borderRadius:12,padding:'16px 16px',
                transition:'transform 0.15s',
              }}>
                <div style={{fontSize:22,marginBottom:8}}>{emoji}</div>
                <div style={{fontSize:13.5,fontWeight:700,color,marginBottom:4}}>{label}</div>
                <div style={{fontSize:12,color:'#6b7280',lineHeight:1.5}}>{sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* CONCLUSION */}
        <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderRadius:14,padding:'44px 36px',margin:'44px 0',textAlign:'center'}}>
          <h2 style={{color:'#fff',fontSize:22,fontWeight:800,margin:'0 0 18px'}}>Conclusion</h2>
          <p style={{color:'#94a3b8',fontSize:14.5,lineHeight:1.85,maxWidth:580,margin:'0 auto 18px'}}>
            Canada's labour market in 2026 is not one story — it's five, and they diverge sharply once you factor in occupation and housing. The dominant theme is a rebalancing away from the coastal giants.
          </p>
          <p style={{color:'#94a3b8',fontSize:14.5,lineHeight:1.85,maxWidth:580,margin:'0 auto 30px'}}>
            Calgary and Ottawa are quietly doing what Toronto and Vancouver cannot: offering meaningful employment opportunities at prices that allow workers to actually build wealth. For those committed to coastal cities, the math still works — but only at the upper end of the income spectrum. For everyone else, the rise of Calgary and Ottawa may be the most important career geography story of this decade.
          </p>
          <blockquote style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'22px 30px',maxWidth:520,margin:'0 auto 30px'}}>
            <p style={{color:'#e2e8f0',fontSize:18,fontWeight:700,fontStyle:'italic',margin:0,lineHeight:1.55}}>
              "Finding the right job changes your career.<br/>Finding the right city changes your life."
            </p>
          </blockquote>
          <div style={{display:'flex',justifyContent:'center',gap:20,flexWrap:'wrap'}}>
            {['lakive.com/ranking','lakive.com/compare','lakive.com/calculate'].map(link=>(
              <a key={link} href={`https://www.${link}`} style={{color:'#60a5fa',fontSize:13,fontWeight:600}}>
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* METHODOLOGY */}
        <div style={{borderTop:'1px solid #e5e7eb',paddingTop:22,marginTop:32}}>
          <h3 style={{fontSize:13.5,fontWeight:700,color:'#374151',margin:'0 0 10px'}}>Methodology</h3>
          <p style={{fontSize:12,color:'#6b7280',lineHeight:1.75,margin:'0 0 8px'}}>
            <strong>EOI (Employment Opportunity Index)</strong> draws on Canada's Job Bank, provincial licensing bodies, and Statistics Canada's Labour Force Survey.
            {' '}<strong>City Fit Score (0–100)</strong> weighs EOI, housing affordability, rent-to-income pressure, and city infrastructure.
            {' '}<strong>HPI Years</strong> = median 2BR home price ÷ gross annual occupational salary (lower is better).
            {' '}<strong>RPI (Rent Pressure Index)</strong> = annual median rent ÷ gross annual salary.
          </p>
          <p style={{fontSize:11.5,color:'#9ca3af',margin:0}}>
            Data reflects H1 2026 conditions · All figures in Canadian dollars · © 2026 Lakive · hello@lakive.com
          </p>
        </div>

      </div>
    </main>
  )
}

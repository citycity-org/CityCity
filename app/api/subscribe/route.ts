import { NextRequest, NextResponse } from 'next/server'

const CITY_NAMES_EN: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}
const CITY_NAMES_ZH: Record<string, string> = {
  vancouver: '温哥华', toronto: '多伦多', calgary: '卡尔加里',
  montreal: '蒙特利尔', ottawa: '渥太华',
}

const OCC_NAMES_EN: Record<string, string> = {
  nurse: 'Registered Nurse', doctor: 'Family Physician', pharmacist: 'Pharmacist',
  data_analyst: 'Data Analyst', software_engineer: 'Software Engineer', it_support: 'IT Support',
  engineer: 'Civil Engineer', electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  teacher: 'Secondary Teacher', lawyer: 'Lawyer', accountant: 'Accountant', social_worker: 'Social Worker',
  mechanic: 'Auto Mechanic', chef: 'Chef', firefighter: 'Firefighter', police_officer: 'Police Officer',
  real_estate_agent: 'Real Estate Agent', financial_advisor: 'Financial Advisor', truck_driver: 'Truck Driver',
  construction_worker: 'Construction Worker', retail_worker: 'Retail Associate', warehouse_worker: 'Warehouse Worker',
  self_employed: 'Self-Employed', freelancer: 'Freelancer',
  unemployed: 'Not Currently Employed', retired: 'Retired / Financially Independent',
}
const OCC_NAMES_ZH: Record<string, string> = {
  nurse: '注册护士', doctor: '家庭医生', pharmacist: '药剂师',
  data_analyst: '数据分析师', software_engineer: '软件工程师', it_support: 'IT支持',
  engineer: '土木工程师', electrician: '电工', plumber: '水管工', carpenter: '木工',
  teacher: '中学教师', lawyer: '律师', accountant: '会计师', social_worker: '社工',
  mechanic: '汽车技师', chef: '厨师', firefighter: '消防员', police_officer: '警察',
  real_estate_agent: '房产经纪', financial_advisor: '财务顾问', truck_driver: '卡车司机',
  construction_worker: '建筑工人', retail_worker: '零售从业者', warehouse_worker: '仓库工人',
  self_employed: '自雇 / 个体经营', freelancer: '自由职业者',
  unemployed: '暂未就业', retired: '退休 / 财富自由',
}

const PT_NAMES_EN: Record<string, string> = {
  '1br': '1 Bedroom', '2br': '2 Bedrooms', '3br': '3 Bedrooms', 'house': 'Detached House',
}
const PT_NAMES_ZH: Record<string, string> = {
  '1br': '一居室', '2br': '两居室', '3br': '三居室', 'house': '独立屋',
}

export async function POST(req: NextRequest) {
  const { email, city, occ, propType, frequency, lang = 'en' } = await req.json()

  if (!email || !city || !frequency) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  // Store subscriber with full profile
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      data: {
        city,
        occ:      occ      || '',
        propType: propType || '',
        frequency,
        lang,
        subscribedAt: new Date().toISOString(),
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  // ── Language-aware confirmation email ──────────────────────────────────────
  const isZh = lang === 'zh'

  const cityName = isZh ? (CITY_NAMES_ZH[city] ?? city) : (CITY_NAMES_EN[city] ?? city)
  const occName  = occ      ? (isZh ? OCC_NAMES_ZH[occ]      : OCC_NAMES_EN[occ])      ?? occ      : null
  const ptName   = propType ? (isZh ? PT_NAMES_ZH[propType]   : PT_NAMES_EN[propType])  ?? propType : null

  const nextSend = frequency === 'quarterly'
    ? (new Date().getMonth() < 9 ? 'Q3 2026' : 'Q4 2026')
    : new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-CA', { year: 'numeric', month: 'long' })

  const subjectCity = occName ? `${cityName} × ${occName}` : cityName

  // ── English email ──────────────────────────────────────────────────────────
  const emailHtmlEn = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;max-width:480px;margin:0 auto;background:#0d1117;border-radius:20px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0d1117 0%,#1a2035 100%);padding:32px 32px 28px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="font-size:20px;font-weight:300;letter-spacing:0.12em;color:white;margin-bottom:20px">
          <span style="color:#14B8A6">LA</span>KıVE
        </div>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0 0 8px;line-height:1.3">You're subscribed ✓</h1>
        <p style="color:rgba(255,255,255,0.50);font-size:13px;margin:0">Your ${subjectCity} report is all set</p>
      </div>
      <div style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="color:rgba(255,255,255,0.40);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">Your subscription profile</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px;width:120px">City</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${cityName}</td></tr>
          ${occName ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">Occupation</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${occName}</td></tr>` : ''}
          ${ptName  ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">Property</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${ptName}</td></tr>` : ''}
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">Plan</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${frequency === 'quarterly' ? 'Quarterly City Intelligence Report' : 'Monthly City Brief'}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">Language</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">English 🇨🇦</td></tr>
        </table>
      </div>
      <div style="padding:20px 32px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="color:rgba(255,255,255,0.45);font-size:12px;margin-bottom:4px">First report estimated</div>
        <div style="color:white;font-size:15px;font-weight:700">${nextSend}</div>
      </div>
      <div style="padding:20px 32px">
        <p style="color:rgba(255,255,255,0.28);font-size:12px;line-height:1.8;margin:0">
          Free · No ads · Unsubscribe anytime<br/>
          Reports are personalised to your city and profession<br/>
          <a href="https://lakive.com" style="color:#4F8EF7;text-decoration:none">lakive.com</a>
        </p>
      </div>
    </div>
  `

  // ── Chinese email ──────────────────────────────────────────────────────────
  const emailHtmlZh = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif;max-width:480px;margin:0 auto;background:#0d1117;border-radius:20px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0d1117 0%,#1a2035 100%);padding:32px 32px 28px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="font-size:20px;font-weight:300;letter-spacing:0.12em;color:white;margin-bottom:20px">
          <span style="color:#14B8A6">LA</span>KıVE
        </div>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0 0 8px;line-height:1.3">订阅成功 ✓</h1>
        <p style="color:rgba(255,255,255,0.50);font-size:13px;margin:0">你的 ${subjectCity} 报告已安排好</p>
      </div>
      <div style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="color:rgba(255,255,255,0.40);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">你的订阅档案</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px;width:80px">订阅城市</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${cityName}</td></tr>
          ${occName ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">职业</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${occName}</td></tr>` : ''}
          ${ptName  ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">住房偏好</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${ptName}</td></tr>` : ''}
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">订阅类型</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">${frequency === 'quarterly' ? '季报（每季度）' : '月报（每月）'}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.45);font-size:12px;padding:6px 0 2px">报告语言</td><td style="color:white;font-size:14px;font-weight:700;padding:6px 0 2px">中文 🇨🇳</td></tr>
        </table>
      </div>
      <div style="padding:20px 32px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="color:rgba(255,255,255,0.45);font-size:12px;margin-bottom:4px">首份报告预计发送</div>
        <div style="color:white;font-size:15px;font-weight:700">${nextSend}</div>
      </div>
      <div style="padding:20px 32px">
        <p style="color:rgba(255,255,255,0.28);font-size:12px;line-height:1.8;margin:0">
          免费订阅 · 无广告 · 随时可一键退订<br/>
          报告将根据你的职业和城市个性化生成<br/>
          <a href="https://lakive.com" style="color:#4F8EF7;text-decoration:none">lakive.com</a>
        </p>
      </div>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lakive <hello@lakive.com>',
      to: email,
      subject: isZh
        ? `订阅成功 · ${subjectCity} 城市报告`
        : `Subscribed · ${subjectCity} City Report`,
      html: isZh ? emailHtmlZh : emailHtmlEn,
    }),
  }).catch(err => console.error('Email send error:', err))

  return NextResponse.json({ ok: true })
}

export const metadata = {
  title: 'Contact — Lakive',
  description: 'Get in touch with the Lakive team.',
}

const CONTACTS = [
  {
    type: 'General & Support',
    email: 'hello@lakive.com',
    desc: '产品问题、数据反馈、账号支持',
    icon: '✉️',
  },
  {
    type: 'Media & Press',
    email: 'hello@lakive.com',
    desc: '媒体采访、品牌合作、引用许可',
    icon: '📰',
  },
  {
    type: 'Business & Partnership',
    email: 'hello@lakive.com',
    desc: '商务合作、数据授权、API接入',
    icon: '🤝',
  },
  {
    type: 'Privacy & Legal',
    email: 'hello@lakive.com',
    desc: '数据访问请求、隐私问题、法律事务',
    icon: '🔒',
  },
]

export default function ContactPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Contact</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Get in Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7 }}>
            我们是一个小团队，认真对待每一封邮件。<br />通常在 1–2 个工作日内回复。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
          {CONTACTS.map(c => (
            <a key={c.type} href={`mailto:${c.email}?subject=${encodeURIComponent(c.type + ' — Lakive')}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px', textDecoration: 'none' }}>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.type}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>{c.desc}</div>
                <div style={{ color: '#4F8EF7', fontSize: 13 }}>{c.email}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ color: '#14B8A6', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>数据错误或城市建议</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7 }}>
            如果你发现数据有误，或希望我们扩展到新城市，请发邮件告诉我们。用户反馈是 Lakive 持续改进的核心动力。
          </div>
        </div>
      </div>
    </main>
  )
}

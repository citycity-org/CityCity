interface LakiveLogoProps {
  size?: number
  theme?: 'dark' | 'light'
  showUnderline?: boolean
}

export function LakiveLogo({ size = 22, theme = 'dark', showUnderline = false }: LakiveLogoProps) {
  const textColor = theme === 'dark' ? '#ffffff' : '#151827'
  const ls = Math.max(1, Math.round(size * 0.09))
  const dotSize = Math.round(size * 0.24)
  const dotTop = Math.round(size * 0.05)

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
        fontSize: size,
        fontWeight: 300,
        letterSpacing: ls,
        lineHeight: 1,
        color: textColor,
      }}>
        <span>L</span>
        <span style={{ fontWeight: 500, color: '#14B8A6' }}>A</span>
        <span>K</span>
        {/* dotless i (U+0131) + orange dot */}
        <span style={{
          position: 'relative',
          display: 'inline-block',
          fontWeight: 500,
          letterSpacing: 0,
          marginRight: ls,
        }}>
          {'ı'}
          <span style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: '#E86C2F',
            top: dotTop,
            left: '50%',
            transform: 'translateX(-50%)',
          }} />
        </span>
        <span>VE</span>
      </span>
      {showUnderline && (
        <span style={{
          display: 'block',
          height: Math.max(1, Math.round(size * 0.05)),
          width: '100%',
          background: '#14B8A6',
          opacity: 0.5,
          borderRadius: 999,
          marginTop: Math.round(size * 0.1),
        }} />
      )}
    </span>
  )
}

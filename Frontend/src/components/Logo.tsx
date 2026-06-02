const FONT: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif", fontWeight: 900 }

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTagline?: boolean
  white?: boolean
}

export function Logo({ size = 'md', showTagline = false, white = false }: LogoProps) {
  const textSize = { sm: '1.1rem', md: '1.5rem', lg: '2rem', xl: '2.75rem' }[size]
  const tagSize  = { sm: '0.55rem', md: '0.65rem', lg: '0.75rem', xl: '0.85rem' }[size]
  const supSize  = { sm: '0.65rem', md: '0.8rem', lg: '1rem', xl: '1.3rem' }[size]
  const color    = white ? '#ffffff' : '#E31E24'
  const tagColor = white ? 'rgba(255,255,255,0.75)' : '#1a1a1a'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, color, ...FONT, fontSize: textSize }}>
        {/* leading dot */}
        <span style={{ fontSize: '0.45em', marginRight: '0.12em', verticalAlign: 'middle', lineHeight: 1 }}>●</span>
        <span>no</span>
        {/* stylised v — a downward chevron circle */}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <svg
            viewBox="0 0 28 26"
            style={{ width: '0.68em', height: '0.65em', verticalAlign: 'middle', marginBottom: '0.05em' }}
            fill={color}
          >
            {/* rounded v shape */}
            <path d="M2 2 L14 22 L26 2" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
        <span>etta</span>
        {/* + superscript */}
        <span style={{ fontSize: supSize, ...FONT, verticalAlign: 'super', marginLeft: '0.05em' }}>+</span>
      </div>

      {showTagline && (
        <span style={{ color: tagColor, fontSize: tagSize, fontFamily: 'system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.03em', marginTop: '0.2em' }}>
          Your Medication Delivery
        </span>
      )}
    </div>
  )
}

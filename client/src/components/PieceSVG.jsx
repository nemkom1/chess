function Pawn({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <circle cx="20" cy="11" r="6" fill={f} stroke={s} strokeWidth="1.5"/>
      <path d="M13 18 C13 15 27 15 27 18 L25 28 H15 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="11" y="28" width="18" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

function Rook({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <rect x="11" y="7" width="5" height="9" fill={f} stroke={s} strokeWidth="1.5" rx="1"/>
      <rect x="17.5" y="7" width="5" height="9" fill={f} stroke={s} strokeWidth="1.5" rx="1"/>
      <rect x="24" y="7" width="5" height="9" fill={f} stroke={s} strokeWidth="1.5" rx="1"/>
      <rect x="11" y="14" width="18" height="4" fill={f} stroke={s} strokeWidth="1.5"/>
      <rect x="12" y="18" width="16" height="10" fill={f} stroke={s} strokeWidth="1.5"/>
      <rect x="10" y="28" width="20" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

function Knight({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <path d="M20 6 C15 6 11 10 11 16 C11 20 13 23 17 24 L15 33 H26 L24 24 C28 22 30 19 30 16 C30 10 25 6 20 6 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="17" cy="16" r="2.5" fill={s}/>
      <rect x="10" y="28" width="20" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

function Bishop({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <circle cx="20" cy="9" r="4" fill={f} stroke={s} strokeWidth="1.5"/>
      <path d="M14 13 C13 20 16 23 20 25 C24 23 27 20 26 13 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="15" y="25" width="10" height="3" fill={f} stroke={s} strokeWidth="1.5"/>
      <rect x="10" y="28" width="20" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

function Queen({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <circle cx="10" cy="10" r="3.5" fill={f} stroke={s} strokeWidth="1.5"/>
      <circle cx="20" cy="7" r="3.5" fill={f} stroke={s} strokeWidth="1.5"/>
      <circle cx="30" cy="10" r="3.5" fill={f} stroke={s} strokeWidth="1.5"/>
      <path d="M10 14 L20 11 L30 14 L27 28 H13 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="10" y="28" width="20" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

function King({ f, s }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <rect x="18.5" y="3" width="3" height="11" rx="1.5" fill={f} stroke={s} strokeWidth="1.5"/>
      <rect x="14" y="7" width="12" height="3" rx="1.5" fill={f} stroke={s} strokeWidth="1.5"/>
      <path d="M13 16 L27 16 L25 28 H15 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="10" y="28" width="20" height="5" rx="2.5" fill={f} stroke={s} strokeWidth="1.5"/>
    </svg>
  )
}

const SHAPES = { p: Pawn, r: Rook, n: Knight, b: Bishop, q: Queen, k: King }

export default function PieceSVG({ piece }) {
  const isWhite = piece === piece.toUpperCase()
  const Shape = SHAPES[piece.toLowerCase()]
  if (!Shape) return null

  const fill = isWhite ? '#f0f0f0' : '#1c1c1c'
  const stroke = isWhite ? '#2a2a2a' : '#d0d0d0'

  return <Shape f={fill} s={stroke} />
}

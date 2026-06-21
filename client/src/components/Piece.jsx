const UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
}

export default function Piece({ piece, isDraggable, onDragStart, onDragEnd }) {
  const isWhite = piece === piece.toUpperCase()

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', piece)
    onDragStart()
  }

  return (
    <span
      className={`piece ${isWhite ? 'piece-white' : 'piece-black'} ${isDraggable ? 'piece-draggable' : ''}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {UNICODE[piece]}
    </span>
  )
}

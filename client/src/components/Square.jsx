import Piece from './Piece'

export default function Square({
  squareId, piece, isLight, isDragSource, label,
  playerColor, isMyTurn, onDragStart, onDrop, onDragEnd
}) {
  const isMyPiece = piece && (
    (playerColor === 'white' && piece === piece.toUpperCase()) ||
    (playerColor === 'black' && piece === piece.toLowerCase())
  )

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e) {
    e.preventDefault()
    onDrop(squareId)
  }

  return (
    <div
      className={[
        'square',
        isLight ? 'square-light' : 'square-dark',
        isDragSource ? 'square-selected' : ''
      ].join(' ')}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {label && <span className="square-label">{label}</span>}
      {piece && (
        <Piece
          piece={piece}
          isDraggable={isMyPiece && isMyTurn}
          onDragStart={() => onDragStart(squareId)}
          onDragEnd={onDragEnd}
        />
      )}
    </div>
  )
}

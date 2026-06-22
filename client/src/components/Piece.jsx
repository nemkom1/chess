import PieceSVG from './PieceSVG'

export default function Piece({ piece, isDraggable, onDragStart, onDragEnd }) {
  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', piece)
    onDragStart()
  }

  return (
    <div
      className={`piece ${isDraggable ? 'piece-draggable' : ''}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <PieceSVG piece={piece} />
    </div>
  )
}

import { useState } from 'react'
import Square from './Square'
import '../styles/board.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

function fenToBoard(fen) {
  const empty = Array(8).fill(null).map(() => Array(8).fill(null))
  if (!fen) return empty
  const rows = fen.split(' ')[0].split('/')
  return rows.map(row => {
    const cells = []
    for (const ch of row) {
      if (isNaN(ch)) {
        cells.push(ch)
      } else {
        for (let i = 0; i < parseInt(ch); i++) cells.push(null)
      }
    }
    return cells
  })
}

function squareFromPoint(x, y) {
  const el = document.elementFromPoint(x, y)
  return el?.closest('[data-sq]')?.dataset?.sq ?? null
}

export default function Board({ fen, playerColor, currentTurn, onMove, status }) {
  const [dragFrom, setDragFrom] = useState(null)

  const board = fenToBoard(fen)
  const isBlack = playerColor === 'black'
  const ranks = isBlack ? [...RANKS].reverse() : RANKS
  const files = isBlack ? [...FILES].reverse() : FILES

  const isMyTurn =
    (playerColor === 'white' && currentTurn === 'w') ||
    (playerColor === 'black' && currentTurn === 'b')
  const isGameOver = ['checkmate', 'stalemate', 'draw'].includes(status)

  function squareId(rankLabel, fileLabel) {
    return `${fileLabel}${rankLabel}`
  }

  function getPiece(rankLabel, fileLabel) {
    const rankIndex = 8 - parseInt(rankLabel)
    const fileIndex = FILES.indexOf(fileLabel)
    return board[rankIndex]?.[fileIndex] ?? null
  }

  function handleDragStart(sq) {
    if (!isMyTurn || isGameOver) return
    setDragFrom(sq)
  }

  function handleDrop(sq) {
    if (!dragFrom || !isMyTurn || isGameOver) {
      setDragFrom(null)
      return
    }
    if (dragFrom !== sq) onMove(dragFrom, sq)
    setDragFrom(null)
  }

  function handleDragEnd() {
    setDragFrom(null)
  }

  function isOwnPiece(piece) {
    if (!piece) return false
    return playerColor === 'white'
      ? piece === piece.toUpperCase()
      : piece === piece.toLowerCase()
  }

  function handleTouchStart(e) {
    e.preventDefault()
  }

  function handleTouchEnd(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    const sq = squareFromPoint(touch.clientX, touch.clientY)
    if (!sq) return

    if (!dragFrom) {
      if (!isMyTurn || isGameOver) return
      const piece = getPiece(sq[1], sq[0])
      if (isOwnPiece(piece)) setDragFrom(sq)
    } else if (sq === dragFrom) {
      setDragFrom(null)
    } else {
      const piece = getPiece(sq[1], sq[0])
      if (isOwnPiece(piece)) {
        setDragFrom(sq)
      } else if (isMyTurn && !isGameOver) {
        onMove(dragFrom, sq)
        setDragFrom(null)
      } else {
        setDragFrom(null)
      }
    }
  }

  const squares = []
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const rank = ranks[r]
      const file = files[f]
      const sq = squareId(rank, file)
      const piece = getPiece(rank, file)
      const fileIdx = FILES.indexOf(file)
      const rankNum = parseInt(rank)
      const isLight = (rankNum + fileIdx) % 2 !== 0
      const showRankLabel = f === 0
      const showFileLabel = r === 7

      squares.push(
        <Square
          key={sq}
          squareId={sq}
          piece={piece}
          isLight={isLight}
          isDragSource={sq === dragFrom}
          label={showRankLabel ? rank : showFileLabel ? file : null}
          playerColor={playerColor}
          isMyTurn={isMyTurn && !isGameOver}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      )
    }
  }

  return (
    <div className="board-container">
      <div
        className="board"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {squares}
      </div>
    </div>
  )
}

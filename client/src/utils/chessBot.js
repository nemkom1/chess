import { Chess } from 'chess.js'

const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

// Pawn/knight/bishop position bonuses (white perspective, rank 0 = rank 8)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
}

function pstBonus(piece, square, isWhite) {
  const table = PST[piece.type]
  if (!table) return 0
  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const idx = isWhite ? (7 - rank) * 8 + file : rank * 8 + file
  return table[idx] ?? 0
}

function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -30000 : 30000
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f]
      if (!p) continue
      const isWhite = p.color === 'w'
      const val = PIECE_VALUE[p.type]
      const pst = pstBonus(p, p.square, isWhite)
      score += isWhite ? (val + pst) : -(val + pst)
    }
  }
  return score
}

// Order moves: captures first (MVV-LVA simplified)
function orderMoves(moves) {
  return moves.sort((a, b) => {
    const aCapture = a.flags.includes('c') || a.flags.includes('e') ? 1 : 0
    const bCapture = b.flags.includes('c') || b.flags.includes('e') ? 1 : 0
    return bCapture - aCapture
  })
}

function minimax(chess, depth, alpha, beta, isMax) {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess)

  const moves = orderMoves(chess.moves({ verbose: true }))
  let best = isMax ? -Infinity : Infinity

  for (const move of moves) {
    chess.move(move)
    const score = minimax(chess, depth - 1, alpha, beta, !isMax)
    chess.undo()

    if (isMax) {
      if (score > best) best = score
      if (score > alpha) alpha = score
    } else {
      if (score < best) best = score
      if (score < beta) beta = score
    }
    if (beta <= alpha) break
  }
  return best
}

export function getBotMove(fen, difficulty) {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = difficulty === 'medium' ? 2 : 3
  const isWhiteTurn = chess.turn() === 'w'

  let bestMove = null
  let bestScore = isWhiteTurn ? -Infinity : Infinity

  const ordered = orderMoves([...moves])
  for (const move of ordered) {
    chess.move(move)
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhiteTurn)
    chess.undo()

    if (isWhiteTurn ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

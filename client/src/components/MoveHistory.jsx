import { useEffect, useRef } from 'react'

export default function MoveHistory({ history }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const pairs = []
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] ?? ''
    })
  }

  return (
    <div className="move-history">
      <h3 className="history-title">История ходов</h3>
      <div className="moves-list">
        {pairs.length === 0 && (
          <p className="no-moves">Ходов пока нет</p>
        )}
        {pairs.map(({ num, white, black }) => (
          <div key={num} className="move-pair">
            <span className="move-num">{num}.</span>
            <span className="move move-white">{white}</span>
            <span className="move move-black">{black}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

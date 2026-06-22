const CHOICES = [
  { key: 'rock', emoji: '✊', name: 'Камень' },
  { key: 'scissors', emoji: '✌️', name: 'Ножницы' },
  { key: 'paper', emoji: '🖐', name: 'Бумага' },
]

const EMOJI = { rock: '✊', scissors: '✌️', paper: '🖐' }

export default function RPS({ rpsState, onChoose }) {
  if (!rpsState) return null

  if (rpsState.type === 'result') {
    const { won, myChoice, opponentChoice, color } = rpsState
    return (
      <div className="rps-screen">
        <div className="rps-card">
          <h2>{won ? '🏆 Вы победили!' : '💀 Вы проиграли'}</h2>
          <div className="rps-showdown">
            <div className="rps-side">
              <span className="rps-big-emoji">{EMOJI[myChoice]}</span>
              <span className="rps-label">Вы</span>
            </div>
            <span className="rps-vs">vs</span>
            <div className="rps-side">
              <span className="rps-big-emoji">{EMOJI[opponentChoice]}</span>
              <span className="rps-label">Противник</span>
            </div>
          </div>
          <p className="rps-color-msg">
            {color === 'white'
              ? '♔ Вы играете белыми и ходите первым!'
              : '♚ Вы играете чёрными'}
          </p>
          <p className="rps-starting">Игра начинается...</p>
        </div>
      </div>
    )
  }

  if (rpsState.type === 'draw') {
    const { choiceA, choiceB } = rpsState
    return (
      <div className="rps-screen">
        <div className="rps-card">
          <h2>🤝 Ничья!</h2>
          <div className="rps-showdown">
            <span className="rps-big-emoji">{EMOJI[choiceA]}</span>
            <span className="rps-vs">vs</span>
            <span className="rps-big-emoji">{EMOJI[choiceB]}</span>
          </div>
          <p className="rps-hint">Переигрываем...</p>
        </div>
      </div>
    )
  }

  if (rpsState.type === 'waiting') {
    return (
      <div className="rps-screen">
        <div className="rps-card">
          <h2>Ждём соперника...</h2>
          <p className="rps-chosen">Вы выбрали: <span className="rps-big-emoji">{EMOJI[rpsState.myChoice]}</span></p>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="rps-screen">
      <div className="rps-card">
        <h2>✊ Камень-Ножницы-Бумага</h2>
        <p className="rps-hint">Победитель играет белыми и ходит первым</p>
        <div className="rps-buttons">
          {CHOICES.map(c => (
            <button key={c.key} className="rps-btn" onClick={() => onChoose(c.key)}>
              <span className="rps-big-emoji">{c.emoji}</span>
              <span className="rps-label">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

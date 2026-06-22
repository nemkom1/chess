import { useState, useRef, useEffect } from 'react'

const QUICK = ['👍 Хороший ход!', '🤔 Думаю...', '😅 Повезло!', 'GG']

export default function ChatBox({ messages, onSend, playerName }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleQuick(msg) {
    onSend(msg)
  }

  return (
    <div className="chat-box">
      <div className="chat-header">Чат</div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">Пока тихо... напишите что-нибудь!</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.senderName === playerName ? 'chat-msg-own' : ''}`}>
            <span className="chat-sender">{msg.senderName === playerName ? 'Вы' : msg.senderName}</span>
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-quick">
        {QUICK.map(q => (
          <button key={q} className="chat-quick-btn" onClick={() => handleQuick(q)}>{q}</button>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          placeholder="Сообщение..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="chat-send-btn" disabled={!text.trim()}>→</button>
      </form>
    </div>
  )
}

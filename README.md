# Chess Online

Многопользовательские шахматы в реальном времени. Два игрока соединяются через 6-символьный код комнаты.

## Стек

- **Frontend**: React + Vite, socket.io-client, CSS Grid, HTML5 drag-and-drop
- **Backend**: Node.js + Express + socket.io, chess.js

## Быстрый старт

### 1. Установка зависимостей

```bash
# Из корня проекта (chess/)
npm run install:all
```

Или вручную:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Запуск

```bash
npm run dev
```

Запустятся оба сервиса одновременно:
- **Сервер**: `http://localhost:3001`
- **Клиент**: `http://localhost:5173`

Открой `http://localhost:5173` в браузере.

## Как играть

1. **Игрок 1** — вводит имя → **Создать игру** → получает 6-символьный код
2. **Игрок 2** — вводит имя → **Войти по коду** → вводит код
3. Оба автоматически попадают в игру. Игрок 1 играет **белыми**.
4. Ходы делаются перетаскиванием фигур. Ходить можно только своими фигурами и только в свой ход.
5. Сервер проверяет все ходы — нелегальные ходы отклоняются.

## Структура проекта

```
chess/
├── client/               # React-приложение (Vite)
│   └── src/
│       ├── App.jsx       # Корневой компонент, управление состоянием
│       ├── socket.js     # WebSocket клиент
│       └── components/
│           ├── Lobby.jsx       # Экран входа
│           ├── Board.jsx       # Шахматная доска
│           ├── Square.jsx      # Клетка доски
│           ├── Piece.jsx       # Фигура
│           ├── StatusBar.jsx   # Статус игры
│           └── MoveHistory.jsx # История ходов
└── server/               # Node.js сервер
    └── src/
        ├── index.js        # Express + socket.io
        ├── roomManager.js  # Управление комнатами
        └── gameHandler.js  # Логика игры
```

## Особенности

- Валидация ходов на сервере (chess.js) — нельзя сделать нелегальный ход
- Автоматическое превращение пешки в ферзя
- Определение шаха, мата, пата, ничьей
- Доска переворачивается для чёрного игрока
- Уведомление при отключении противника
- История ходов в алгебраической нотации

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: multiplayer chess app"
git remote add origin <your-repo-url>
git push -u origin main
```

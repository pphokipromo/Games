# 🕵️ Secret Mission Online

Game multiplayer real-time berbasis browser. 3–10 pemain bisa bergabung dalam satu room dan saling bersaing menyelesaikan misi rahasia tanpa ketahuan.

---

## 🗂️ Struktur Project

```
secret-mission-online/
├── backend/                 # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── index.js         # Entry point server
│   │   ├── game/
│   │   │   ├── constants.js      # Pertanyaan, misi, config game
│   │   │   ├── roomManager.js    # State management semua room
│   │   │   └── missionChecker.js # Logic pengecekan misi
│   │   └── socket/
│   │       └── handlers.js  # Semua Socket.IO event handlers
│   ├── package.json
│   └── .env.example
│
└── frontend/                # Next.js 14 + TailwindCSS
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Root layout + fonts
    │   │   ├── globals.css       # Global styles
    │   │   ├── page.tsx          # Home (Create/Join Room)
    │   │   └── room/[code]/
    │   │       └── page.tsx      # Lobby page
    │   ├── components/
    │   │   ├── game/
    │   │   │   ├── GameScreen.tsx     # Orchestrator utama
    │   │   │   ├── MissionReveal.tsx  # Overlay misi rahasia
    │   │   │   ├── QuestionPhase.tsx  # Fase menjawab pertanyaan
    │   │   │   ├── DiscussionPhase.tsx # Fase diskusi + chat
    │   │   │   ├── VotingPhase.tsx    # Fase voting
    │   │   │   ├── RoundResult.tsx    # Hasil per ronde
    │   │   │   └── FinalResult.tsx    # Leaderboard akhir
    │   │   └── ui/
    │   │       ├── TimerBar.tsx   # Komponen timer visual
    │   │       └── GameHeader.tsx # Header dengan info ronde
    │   ├── hooks/
    │   │   ├── useGame.ts    # Central game state + socket events
    │   │   └── useTimer.ts   # Countdown timer hook
    │   ├── lib/
    │   │   └── socket.ts     # Socket.IO client singleton
    │   └── types/
    │       └── game.ts       # TypeScript interfaces
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## ⚡ Quick Start (Development)

### 1. Clone / ekstrak project

```bash
cd secret-mission-online
```

### 2. Jalankan Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Server berjalan di http://localhost:4000
```

### 3. Jalankan Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
npm run dev
# App berjalan di http://localhost:3000
```

### 4. Buka di browser

- Buka `http://localhost:3000` di 2+ tab/device
- Satu orang buat room → share room code → yang lain join
- Minimal 3 pemain untuk mulai

---

## 🚀 Deployment

### Backend → Render.com (Free)

1. Buat akun di [render.com](https://render.com)
2. New → Web Service → Connect repo
3. Settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Environment Variables:
   ```
   PORT=4000
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Copy URL backend (contoh: `https://smo-backend.onrender.com`)

### Frontend → Vercel (Free)

1. Buka [vercel.com](https://vercel.com) → New Project
2. Import repo, set **Root Directory** ke `frontend`
3. Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://smo-backend.onrender.com
   ```
4. Deploy → selesai!

---

## 🎮 Game Flow

```
HOME
 │
 ├─ Buat Room → Lobby (jadi Host)
 └─ Join Room → Lobby (pakai kode 6 digit)
      │
      └─ Semua Ready + Host klik Start
           │
           ▼
    ┌─────────────────────────────────────────┐
    │  LOOP: 5 Ronde                          │
    │                                         │
    │  1. [QUESTION 60s]                      │
    │     - Terima misi rahasia (private)     │
    │     - Baca pertanyaan                   │
    │     - Submit jawaban                    │
    │                                         │
    │  2. [DISCUSSION 45s]                    │
    │     - Lihat semua jawaban               │
    │     - Chat real-time                    │
    │     - Coba selesaikan misi              │
    │                                         │
    │  3. [VOTING 30s]                        │
    │     - Vote pemain paling mencurigakan   │
    │                                         │
    │  4. [ROUND RESULT 8s]                   │
    │     - Lihat siapa yang misi sukses/gagal│
    │     - Update skor                       │
    └─────────────────────────────────────────┘
           │
           ▼
    FINAL RESULT
    - Leaderboard
    - Podium
    - Total misi sukses
```

---

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Keterangan |
|-------|---------|------------|
| `createRoom` | `{ username }` | Buat room baru |
| `joinRoom` | `{ code, username }` | Gabung room |
| `playerReady` | `{ isReady }` | Toggle ready |
| `startGame` | - | Host mulai game |
| `submitAnswer` | `{ answer }` | Kirim jawaban |
| `sendChat` | `{ text }` | Pesan chat |
| `submitVote` | `{ targetId }` | Vote pemain |

### Server → Client

| Event | Payload | Keterangan |
|-------|---------|------------|
| `roomUpdated` | `{ room }` | State room berubah |
| `playerJoined` | `{ player, room }` | Pemain baru masuk |
| `playerLeft` | `{ playerId, room }` | Pemain keluar |
| `sendMission` | `{ mission }` | Misi private (per socket) |
| `sendQuestion` | `{ question, round, ... }` | Pertanyaan ronde baru |
| `answerCountUpdated` | `{ count, total }` | Update jumlah jawaban |
| `startDiscussion` | `{ answers, duration }` | Mulai fase diskusi |
| `newChatMessage` | `{ message }` | Pesan chat baru |
| `startVoting` | `{ players, duration }` | Mulai fase voting |
| `voteCountUpdated` | `{ count, total }` | Update jumlah vote |
| `roundResult` | `{ results }` | Hasil ronde |
| `endGame` | `{ finalScores }` | Game selesai |
| `gameAborted` | `{ reason }` | Game dihentikan |

---

## 🎯 Sistem Misi

| Misi | Cara Sukses | Poin |
|------|-------------|------|
| Match Two | 2 pemain lain jawaban mirip denganmu | +100 |
| No Vote | Tidak dapat satupun vote | +100 |
| Use Money Word | Kata "uang/duit" ≥3x | +100 |
| Most Votes | Dapat vote terbanyak (min 2) | +100 |
| Short Answer | Jawab < 5 kata | +100 |
| Long Answer | Jawab > 20 kata | +100 |
| Question Answer | Jawab dengan kalimat tanya | +100 |
| Use English | ≥3 kata bahasa Inggris | +100 |
| Copy Someone | Jawaban mirip pemain lain (≥50%) | +100 |
| Be Specific | Ada angka atau nama spesifik | +100 |

**Bonus/Penalti:**
- 🎯 Most voted player: **-50 poin**

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| Realtime | Socket.IO Client |
| Backend | Node.js + Express |
| Realtime | Socket.IO Server |
| State | In-memory (Map) |
| Deploy FE | Vercel |
| Deploy BE | Render / VPS |

---

## 📝 Customisasi

### Tambah Pertanyaan
Edit `backend/src/game/constants.js` → array `QUESTIONS`

### Tambah Misi
Edit array `MISSIONS` + tambah fungsi di `missionChecker.js`

### Ubah Timer
Edit `GAME_CONFIG` di `constants.js`:
- `ANSWER_TIME` → waktu menjawab (detik)
- `DISCUSSION_TIME` → waktu diskusi
- `VOTING_TIME` → waktu voting

### Ubah Jumlah Ronde
Edit `TOTAL_ROUNDS` di `GAME_CONFIG`

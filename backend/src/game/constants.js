// src/game/constants.js

const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 10,
  TOTAL_ROUNDS: 5,
  ANSWER_TIME: 60,       // seconds
  DISCUSSION_TIME: 45,   // seconds
  VOTING_TIME: 30,       // seconds
  RESULT_DISPLAY: 8,     // seconds
};

const SCORING = {
  MISSION_SUCCESS: 100,
  MISSION_FAIL: 0,
  MOST_VOTED_PENALTY: -50,
  CORRECT_GUESS: 30,
};

const QUESTIONS = [
  "Jika punya 1 miliar rupiah, apa yang pertama kamu beli?",
  "Tempat liburan impian kamu di dunia?",
  "Hal paling mahal yang pernah kamu inginkan tapi belum beli?",
  "Kalau bisa punya satu kekuatan super, apa yang kamu pilih?",
  "Makanan apa yang bisa kamu makan setiap hari tanpa bosan?",
  "Jika harus hidup tanpa satu teknologi, apa yang kamu pilih?",
  "Pekerjaan impian kamu waktu kecil dulu apa?",
  "Film atau series apa yang paling berkesan buat kamu?",
  "Jika bisa tinggal di satu negara seumur hidup, mana pilihanmu?",
  "Apa hal tergila yang pernah kamu lakukan?",
  "Kalau kamu bisa undang 3 orang terkenal makan malam, siapa saja?",
  "Satu keahlian apa yang ingin kamu kuasai dalam 1 tahun?",
  "Jika harus pindah ke luar negeri besok, kamu mau ke mana?",
  "Hal apa yang selalu buat kamu semangat setiap pagi?",
  "Apa yang pertama kamu lakukan kalau tiba-tiba dapat uang 100 juta?",
];

const MISSIONS = [
  {
    id: "match_two",
    text: "Buat minimal 2 pemain lain memilih jawaban yang mirip atau sama denganmu.",
    type: "social",
    checkFn: "checkMatchTwo",
  },
  {
    id: "no_vote",
    text: "Jangan sampai mendapat vote satupun di ronde ini.",
    type: "stealth",
    checkFn: "checkNoVote",
  },
  {
    id: "use_money_word",
    text: "Gunakan kata 'uang' atau 'duit' minimal 3 kali dalam jawabanmu.",
    type: "word",
    checkFn: "checkMoneyWord",
  },
  {
    id: "most_votes",
    text: "Dapatkan vote terbanyak di ronde ini (minimal 2 vote).",
    type: "bold",
    checkFn: "checkMostVotes",
  },
  {
    id: "short_answer",
    text: "Jawab dengan kurang dari 5 kata.",
    type: "stealth",
    checkFn: "checkShortAnswer",
  },
  {
    id: "long_answer",
    text: "Jawab dengan lebih dari 20 kata.",
    type: "word",
    checkFn: "checkLongAnswer",
  },
  {
    id: "question_answer",
    text: "Jawab pertanyaan dengan pertanyaan balik (kalimat tanya).",
    type: "stealth",
    checkFn: "checkQuestionAnswer",
  },
  {
    id: "use_english",
    text: "Gunakan minimal 3 kata bahasa Inggris dalam jawabanmu.",
    type: "word",
    checkFn: "checkEnglish",
  },
  {
    id: "copy_someone",
    text: "Buat jawabanmu semirip mungkin dengan jawaban pemain lain.",
    type: "social",
    checkFn: "checkCopySomeone",
  },
  {
    id: "be_specific",
    text: "Sebutkan angka atau nama spesifik dalam jawabanmu.",
    type: "word",
    checkFn: "checkSpecific",
  },
];

const GAME_PHASES = {
  LOBBY: "lobby",
  MISSION: "mission",
  QUESTION: "question",
  DISCUSSION: "discussion",
  VOTING: "voting",
  ROUND_RESULT: "round_result",
  GAME_OVER: "game_over",
};

module.exports = { GAME_CONFIG, SCORING, QUESTIONS, MISSIONS, GAME_PHASES };

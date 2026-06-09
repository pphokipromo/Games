// src/game/roomManager.js

const { GAME_CONFIG, QUESTIONS, MISSIONS, GAME_PHASES, SCORING } = require("./constants");
const { checkMission } = require("./missionChecker");

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> roomState
  }

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;
    do {
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocket) {
    const code = this.generateRoomCode();
    const room = {
      code,
      hostId: hostSocket.id,
      phase: GAME_PHASES.LOBBY,
      players: [],
      round: 0,
      totalRounds: GAME_CONFIG.TOTAL_ROUNDS,
      currentQuestion: null,
      answers: {},
      missions: {},
      votes: {},
      chatMessages: [],
      usedQuestions: [],
      timer: null,
    };
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code, socket, username) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: "Room tidak ditemukan." };
    if (room.players.length >= GAME_CONFIG.MAX_PLAYERS) return { error: "Room sudah penuh." };
    if (room.phase !== GAME_PHASES.LOBBY) return { error: "Game sudah dimulai." };
    if (room.players.find(p => p.id === socket.id)) return { error: "Kamu sudah ada di room ini." };

    const cleanName = username.trim().slice(0, 20) || `Player${room.players.length + 1}`;
    const player = {
      id: socket.id,
      username: cleanName,
      ready: false,
      score: 0,
      missionSuccesses: 0,
      avatar: this._getAvatar(room.players.length),
    };
    room.players.push(player);
    return { room, player };
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socketId);
      if (idx !== -1) {
        const [removed] = room.players.splice(idx, 1);
        // Transfer host
        if (room.hostId === socketId && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }
        // Clean up empty rooms
        if (room.players.length === 0) {
          if (room.timer) clearTimeout(room.timer);
          this.rooms.delete(code);
        }
        return { room, removed, code };
      }
    }
    return null;
  }

  setReady(socketId, isReady) {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.id === socketId);
      if (player) {
        player.ready = isReady;
        return room;
      }
    }
    return null;
  }

  getRoomByPlayer(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.find(p => p.id === socketId)) return room;
    }
    return null;
  }

  canStartGame(room) {
    if (room.players.length < GAME_CONFIG.MIN_PLAYERS) {
      return { ok: false, reason: `Minimal ${GAME_CONFIG.MIN_PLAYERS} pemain diperlukan.` };
    }
    return { ok: true };
  }

  startGame(room) {
    room.phase = GAME_PHASES.QUESTION;
    room.round = 1;
    room.answers = {};
    room.votes = {};
    room.chatMessages = [];
    this._assignMissions(room);
    this._assignQuestion(room);
    return room;
  }

  _assignMissions(room) {
    const shuffled = [...MISSIONS].sort(() => Math.random() - 0.5);
    room.players.forEach((player, i) => {
      room.missions[player.id] = shuffled[i % shuffled.length];
    });
  }

  _assignQuestion(room) {
    const unused = QUESTIONS.filter(q => !room.usedQuestions.includes(q));
    const pool = unused.length > 0 ? unused : QUESTIONS;
    const q = pool[Math.floor(Math.random() * pool.length)];
    room.currentQuestion = q;
    room.usedQuestions.push(q);
    room.answers = {};
    room.votes = {};
  }

  submitAnswer(socketId, answer) {
    const room = this.getRoomByPlayer(socketId);
    if (!room || room.phase !== GAME_PHASES.QUESTION) return null;
    room.answers[socketId] = answer.trim().slice(0, 300);
    return room;
  }

  allAnswered(room) {
    return room.players.every(p => room.answers[p.id] !== undefined);
  }

  startDiscussion(room) {
    room.phase = GAME_PHASES.DISCUSSION;
    return room;
  }

  addChatMessage(socketId, text) {
    const room = this.getRoomByPlayer(socketId);
    if (!room) return null;
    const player = room.players.find(p => p.id === socketId);
    if (!player) return null;

    const msg = {
      id: Date.now() + Math.random(),
      playerId: socketId,
      username: player.username,
      avatar: player.avatar,
      text: text.trim().slice(0, 200),
      timestamp: Date.now(),
    };
    room.chatMessages.push(msg);
    if (room.chatMessages.length > 100) room.chatMessages.shift();
    return { room, msg };
  }

  startVoting(room) {
    room.phase = GAME_PHASES.VOTING;
    return room;
  }

  submitVote(socketId, targetId) {
    const room = this.getRoomByPlayer(socketId);
    if (!room || room.phase !== GAME_PHASES.VOTING) return null;
    if (socketId === targetId) return { error: "Tidak bisa vote diri sendiri." };
    room.votes[socketId] = targetId;
    return room;
  }

  allVoted(room) {
    return room.players.every(p => room.votes[p.id] !== undefined);
  }

  resolveRound(room) {
    room.phase = GAME_PHASES.ROUND_RESULT;
    const voteCounts = {};
    room.players.forEach(p => { voteCounts[p.id] = 0; });
    Object.values(room.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const roundData = { answers: room.answers, votes: room.votes };

    const results = room.players.map(player => {
      const mission = room.missions[player.id];
      const success = mission ? checkMission(mission, player, roundData) : false;
      const gotVotes = voteCounts[player.id] || 0;
      const isMostVoted = gotVotes === maxVotes && maxVotes > 0;

      let pointsEarned = 0;
      if (success) {
        pointsEarned += SCORING.MISSION_SUCCESS;
        player.missionSuccesses++;
      }
      if (isMostVoted) {
        pointsEarned += SCORING.MOST_VOTED_PENALTY;
      }
      player.score += pointsEarned;

      return {
        playerId: player.id,
        username: player.username,
        avatar: player.avatar,
        mission: mission ? mission.text : "",
        missionSuccess: success,
        voteCount: gotVotes,
        isMostVoted,
        pointsEarned,
        totalScore: player.score,
      };
    });

    return { results, voteCounts };
  }

  nextRound(room) {
    room.round++;
    if (room.round > room.totalRounds) {
      room.phase = GAME_PHASES.GAME_OVER;
      return { gameOver: true };
    }
    this._assignMissions(room);
    this._assignQuestion(room);
    room.phase = GAME_PHASES.QUESTION;
    return { gameOver: false };
  }

  getFinalScores(room) {
    return room.players
      .map(p => ({
        playerId: p.id,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        missionSuccesses: p.missionSuccesses,
      }))
      .sort((a, b) => b.score - a.score);
  }

  getPublicRoom(room) {
    return {
      code: room.code,
      hostId: room.hostId,
      phase: room.phase,
      round: room.round,
      totalRounds: room.totalRounds,
      players: room.players.map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        ready: p.ready,
        score: p.score,
      })),
      currentQuestion: room.currentQuestion,
      answerCount: Object.keys(room.answers).length,
      voteCount: Object.keys(room.votes).length,
      chatMessages: room.chatMessages.slice(-30),
    };
  }

  _getAvatar(index) {
    const avatars = ["🦊", "🐼", "🦁", "🐯", "🦄", "🐸", "🦋", "🐙", "🦅", "🐺"];
    return avatars[index % avatars.length];
  }
}

module.exports = new RoomManager();

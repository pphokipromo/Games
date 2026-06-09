// src/socket/handlers.js

const roomManager = require("../game/roomManager");
const { GAME_CONFIG, GAME_PHASES } = require("../game/constants");

function createTimerManager() {
  const timers = new Map();
  return {
    set(roomCode, fn, delay) {
      this.clear(roomCode);
      timers.set(roomCode, setTimeout(fn, delay));
    },
    clear(roomCode) {
      if (timers.has(roomCode)) {
        clearTimeout(timers.get(roomCode));
        timers.delete(roomCode);
      }
    },
  };
}

const timerManager = createTimerManager();

module.exports = function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── CREATE ROOM ──────────────────────────────────────────
    socket.on("createRoom", ({ username }, cb) => {
      try {
        const room = roomManager.createRoom(socket);
        const result = roomManager.joinRoom(room.code, socket, username);
        if (result.error) return cb({ error: result.error });

        socket.join(room.code);
        cb({ room: roomManager.getPublicRoom(result.room) });
        console.log(`[Room] Created: ${room.code} by ${username}`);
      } catch (err) {
        console.error("[createRoom]", err);
        cb({ error: "Gagal membuat room." });
      }
    });

    // ── JOIN ROOM ────────────────────────────────────────────
    socket.on("joinRoom", ({ code, username }, cb) => {
      try {
        const result = roomManager.joinRoom(code, socket, username);
        if (result.error) return cb({ error: result.error });

        socket.join(result.room.code);
        const publicRoom = roomManager.getPublicRoom(result.room);
        cb({ room: publicRoom });

        socket.to(result.room.code).emit("playerJoined", {
          player: {
            id: result.player.id,
            username: result.player.username,
            avatar: result.player.avatar,
            ready: false,
            score: 0,
          },
          room: publicRoom,
        });
        console.log(`[Room] ${username} joined ${result.room.code}`);
      } catch (err) {
        console.error("[joinRoom]", err);
        cb({ error: "Gagal bergabung ke room." });
      }
    });

    // ── PLAYER READY ─────────────────────────────────────────
    socket.on("playerReady", ({ isReady }) => {
      const room = roomManager.setReady(socket.id, isReady);
      if (!room) return;
      io.to(room.code).emit("roomUpdated", { room: roomManager.getPublicRoom(room) });
    });

    // ── START GAME ───────────────────────────────────────────
    socket.on("startGame", (_, cb) => {
      try {
        const room = roomManager.getRoomByPlayer(socket.id);
        if (!room) return cb?.({ error: "Room tidak ditemukan." });
        if (room.hostId !== socket.id) return cb?.({ error: "Hanya host yang bisa memulai game." });

        const { ok, reason } = roomManager.canStartGame(room);
        if (!ok) return cb?.({ error: reason });

        roomManager.startGame(room);

        // Send private missions
        room.players.forEach(player => {
          const mission = room.missions[player.id];
          io.to(player.id).emit("sendMission", { mission });
        });

        // Broadcast question
        io.to(room.code).emit("sendQuestion", {
          question: room.currentQuestion,
          round: room.round,
          totalRounds: room.totalRounds,
          duration: GAME_CONFIG.ANSWER_TIME,
        });

        io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.QUESTION });

        // Auto-advance when timer expires
        scheduleDiscussion(io, room);
        cb?.({ ok: true });
      } catch (err) {
        console.error("[startGame]", err);
        cb?.({ error: "Gagal memulai game." });
      }
    });

    // ── SUBMIT ANSWER ────────────────────────────────────────
    socket.on("submitAnswer", ({ answer }) => {
      const room = roomManager.submitAnswer(socket.id, answer);
      if (!room) return;

      io.to(room.code).emit("answerCountUpdated", {
        count: Object.keys(room.answers).length,
        total: room.players.length,
      });

      if (roomManager.allAnswered(room)) {
        timerManager.clear(room.code);
        scheduleDiscussion(io, room, 0);
      }
    });

    // ── SEND CHAT ────────────────────────────────────────────
    socket.on("sendChat", ({ text }) => {
      if (!text?.trim()) return;
      const result = roomManager.addChatMessage(socket.id, text);
      if (!result) return;
      io.to(result.room.code).emit("newChatMessage", { message: result.msg });
    });

    // ── SUBMIT VOTE ──────────────────────────────────────────
    socket.on("submitVote", ({ targetId }) => {
      const result = roomManager.submitVote(socket.id, targetId);
      if (!result || result.error) return;
      const room = result;

      io.to(room.code).emit("voteCountUpdated", {
        count: Object.keys(room.votes).length,
        total: room.players.length,
      });

      if (roomManager.allVoted(room)) {
        timerManager.clear(room.code);
        resolveAndShowResults(io, room);
      }
    });

    // ── DISCONNECT ───────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      const result = roomManager.removePlayer(socket.id);
      if (!result) return;

      const { room, removed, code } = result;
      if (room) {
        const publicRoom = roomManager.getPublicRoom(room);
        io.to(code).emit("playerLeft", {
          playerId: removed.id,
          username: removed.username,
          newHostId: room.hostId,
          room: publicRoom,
        });

        // If game in progress and not enough players, end game
        if (room.phase !== GAME_PHASES.LOBBY && room.players.length < GAME_CONFIG.MIN_PLAYERS) {
          timerManager.clear(code);
          io.to(code).emit("gameAborted", {
            reason: "Pemain tidak cukup untuk melanjutkan game.",
          });
        }
      }
    });
  });

  // ── INTERNAL HELPERS ─────────────────────────────────────

  function scheduleDiscussion(io, room, delay = GAME_CONFIG.ANSWER_TIME * 1000) {
    timerManager.set(room.code, () => {
      roomManager.startDiscussion(room);
      io.to(room.code).emit("startDiscussion", {
        answers: room.answers,
        duration: GAME_CONFIG.DISCUSSION_TIME,
      });
      io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.DISCUSSION });
      scheduleVoting(io, room);
    }, delay);
  }

  function scheduleVoting(io, room) {
    timerManager.set(room.code, () => {
      roomManager.startVoting(room);
      io.to(room.code).emit("startVoting", {
        players: room.players.map(p => ({ id: p.id, username: p.username, avatar: p.avatar })),
        duration: GAME_CONFIG.VOTING_TIME,
      });
      io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.VOTING });

      timerManager.set(room.code, () => {
        resolveAndShowResults(io, room);
      }, GAME_CONFIG.VOTING_TIME * 1000);
    }, GAME_CONFIG.DISCUSSION_TIME * 1000);
  }

  function resolveAndShowResults(io, room) {
    const { results, voteCounts } = roomManager.resolveRound(room);

    io.to(room.code).emit("roundResult", {
      results,
      voteCounts,
      round: room.round,
    });
    io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.ROUND_RESULT });

    timerManager.set(room.code, () => {
      const { gameOver } = roomManager.nextRound(room);

      if (gameOver) {
        const finalScores = roomManager.getFinalScores(room);
        io.to(room.code).emit("endGame", { finalScores });
        io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.GAME_OVER });
      } else {
        // Send new missions privately
        room.players.forEach(player => {
          const mission = room.missions[player.id];
          io.to(player.id).emit("sendMission", { mission });
        });

        io.to(room.code).emit("sendQuestion", {
          question: room.currentQuestion,
          round: room.round,
          totalRounds: room.totalRounds,
          duration: GAME_CONFIG.ANSWER_TIME,
        });
        io.to(room.code).emit("phaseChanged", { phase: GAME_PHASES.QUESTION });
        scheduleDiscussion(io, room);
      }
    }, GAME_CONFIG.RESULT_DISPLAY * 1000);
  }
};

// src/components/game/FinalResult.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function FinalResult() {
  const { state, reset } = useGame();
  const router = useRouter();

  const myFinal = state.finalScores.find(s => s.playerId === state.myId);
  const myRank = state.finalScores.findIndex(s => s.playerId === state.myId) + 1;

  const handlePlayAgain = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 result-bg animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">
          {myRank <= 3 ? RANK_ICONS[myRank - 1] : "🎮"}
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gold via-accent-light to-neon bg-clip-text text-transparent">
          Game Over!
        </h1>
        {myFinal && (
          <div className="mt-3">
            <p className="text-text-secondary text-sm">Kamu finish</p>
            <p className="text-2xl font-bold text-text-primary">
              #{myRank} dengan {myFinal.score} poin
            </p>
            <p className="text-sm text-muted mt-1">
              {myFinal.missionSuccesses} misi berhasil dari {state.totalRounds} ronde
            </p>
          </div>
        )}
      </div>

      {/* Podium top 3 */}
      {state.finalScores.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {/* 2nd */}
          <div className="flex flex-col items-center w-20">
            <div className="text-3xl">{state.finalScores[1]?.avatar}</div>
            <p className="text-xs text-center truncate w-full text-muted mt-1">{state.finalScores[1]?.username}</p>
            <p className="text-sm font-bold text-text-secondary">{state.finalScores[1]?.score}</p>
            <div className="bg-card border border-border rounded-t-xl w-full h-12 flex items-center justify-center mt-1">
              <span className="text-xl">🥈</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center w-20">
            <div className="text-4xl">{state.finalScores[0]?.avatar}</div>
            <p className="text-xs text-center truncate w-full text-gold mt-1 font-semibold">{state.finalScores[0]?.username}</p>
            <p className="text-base font-bold text-gold">{state.finalScores[0]?.score}</p>
            <div className="bg-gold/10 border border-gold/40 rounded-t-xl w-full h-20 flex items-center justify-center mt-1 glow-gold">
              <span className="text-2xl">🥇</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center w-20">
            <div className="text-3xl">{state.finalScores[2]?.avatar}</div>
            <p className="text-xs text-center truncate w-full text-muted mt-1">{state.finalScores[2]?.username}</p>
            <p className="text-sm font-bold text-text-secondary">{state.finalScores[2]?.score}</p>
            <div className="bg-card border border-border rounded-t-xl w-full h-8 flex items-center justify-center mt-1">
              <span className="text-lg">🥉</span>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="card mb-6">
        <p className="text-xs text-muted mb-3 uppercase tracking-wider">🏆 Leaderboard Final</p>
        <div className="space-y-2">
          {state.finalScores.map((player, i) => (
            <div
              key={player.playerId}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                player.playerId === state.myId
                  ? "bg-accent/10 border border-accent/30"
                  : "bg-surface"
              }`}
            >
              <span className="text-base font-bold w-6 text-center">
                {RANK_ICONS[i] || `${i + 1}`}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{player.username}</p>
                <p className="text-xs text-muted">{player.missionSuccesses} misi sukses</p>
              </div>
              <p className={`font-bold text-lg ${i === 0 ? "text-gold" : "text-accent-light"}`}>
                {player.score}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        onClick={handlePlayAgain}
      >
        🔄 Main Lagi
      </button>
    </div>
  );
}

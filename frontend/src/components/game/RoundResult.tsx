// src/components/game/RoundResult.tsx
"use client";

import { useGame } from "@/hooks/useGame";
import GameHeader from "@/components/ui/GameHeader";

export default function RoundResult() {
  const { state } = useGame();
  const myResult = state.roundResults.find(r => r.playerId === state.myId);

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 animate-fade-in">
      <GameHeader />

      {/* My result hero */}
      {myResult && (
        <div className={`rounded-2xl p-5 mb-4 text-center ${
          myResult.missionSuccess
            ? "bg-success/10 border border-success/30 glow-success"
            : "bg-danger/10 border border-danger/30"
        }`}>
          <div className="text-5xl mb-2">{myResult.missionSuccess ? "🎉" : "😔"}</div>
          <p className="text-xl font-bold">
            {myResult.missionSuccess ? "Misi Berhasil!" : "Misi Gagal"}
          </p>
          <p className="text-sm text-muted mt-1 mb-3">"{myResult.mission}"</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold ${myResult.pointsEarned > 0 ? "text-success" : myResult.pointsEarned < 0 ? "text-danger" : "text-muted"}`}>
              {myResult.pointsEarned > 0 ? "+" : ""}{myResult.pointsEarned}
            </span>
            <span className="text-muted">poin</span>
          </div>
          {myResult.isMostVoted && (
            <p className="text-xs text-danger mt-2">
              🎯 Kamu dapat vote terbanyak! (-50 poin)
            </p>
          )}
        </div>
      )}

      {/* All results */}
      <div className="card mb-4">
        <p className="text-xs text-muted mb-3 uppercase tracking-wider">Hasil Ronde {state.round}</p>
        <div className="space-y-3">
          {state.roundResults.map(r => (
            <div key={r.playerId} className={`flex items-start gap-3 p-3 rounded-xl ${
              r.playerId === state.myId ? "bg-accent/10 border border-accent/20" : "bg-surface"
            }`}>
              <div className="text-2xl">{r.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{r.username}</p>
                  {r.isMostVoted && <span className="badge bg-danger/20 text-danger text-xs">🎯 Tersangka</span>}
                </div>
                <p className="text-xs text-muted truncate mt-0.5">
                  Misi: {r.mission}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs badge ${r.missionSuccess ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                    {r.missionSuccess ? "✓ Berhasil" : "✗ Gagal"}
                  </span>
                  <span className="text-xs text-muted">{r.voteCount} vote</span>
                  <span className={`text-xs font-bold ml-auto ${r.pointsEarned > 0 ? "text-success" : r.pointsEarned < 0 ? "text-danger" : "text-muted"}`}>
                    {r.pointsEarned > 0 ? "+" : ""}{r.pointsEarned}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="card">
        <p className="text-xs text-muted mb-3 uppercase tracking-wider">🏆 Skor Sementara</p>
        <div className="space-y-2">
          {[...state.roundResults]
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((r, i) => (
              <div key={r.playerId} className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted w-5">{i + 1}</span>
                <span className="text-lg">{r.avatar}</span>
                <p className="text-sm flex-1 truncate">{r.username}</p>
                <p className="font-bold text-accent-light">{r.totalScore}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-muted text-sm animate-pulse-slow">⏳ Ronde berikutnya segera dimulai...</p>
      </div>
    </div>
  );
}

// src/components/game/VotingPhase.tsx
"use client";

import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import TimerBar from "@/components/ui/TimerBar";
import GameHeader from "@/components/ui/GameHeader";

export default function VotingPhase() {
  const { state, submitVote } = useGame();
  const { timeLeft, percentage, isUrgent } = useTimer(30);

  const otherPlayers = state.room?.players.filter(p => p.id !== state.myId) || [];

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 animate-fade-in">
      <GameHeader />
      <TimerBar percentage={percentage} timeLeft={timeLeft} isUrgent={isUrgent} label="Waktu Voting" />

      {/* Mission reminder */}
      {state.myMission && (
        <div className="mission-card rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-xs text-accent-light">{state.myMission.text}</p>
        </div>
      )}

      <div className="card mb-4 text-center">
        <p className="text-lg font-bold">🗳️ Siapa yang Mencurigakan?</p>
        <p className="text-sm text-muted mt-1">Vote pemain yang menurutmu sedang menjalankan misi tersembunyi</p>
      </div>

      {state.hasVoted ? (
        <div className="card border-success/40 glow-success text-center py-6 mb-4">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-semibold text-success">Vote terkirim!</p>
          <p className="text-sm text-muted mt-1">
            Menunggu pemain lain... ({state.voteCount}/{state.room?.players.length ?? 0})
          </p>
          {/* Show who they voted */}
          {state.myVote && (
            <p className="text-xs text-muted mt-2">
              Kamu vote: <strong className="text-text-primary">
                {state.room?.players.find(p => p.id === state.myVote)?.username}
              </strong>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {otherPlayers.map(player => (
            <button
              key={player.id}
              className={`vote-card w-full flex items-center gap-3 text-left transition-all hover:-translate-y-0.5 ${
                state.myVote === player.id ? "selected" : ""
              }`}
              onClick={() => submitVote(player.id)}
            >
              <div className="player-avatar text-xl">{player.avatar}</div>
              <div className="flex-1">
                <p className="font-semibold">{player.username}</p>
                <p className="text-xs text-muted truncate">
                  "{state.answers[player.id] || 'tidak menjawab'}"
                </p>
              </div>
              <span className="text-muted text-xl">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Vote progress */}
      <div className="mt-4 card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted">Sudah vote</p>
          <p className="text-xs font-semibold text-accent-light">
            {state.voteCount} / {state.room?.players.length ?? 0}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {state.room?.players.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 min-w-[16px] rounded-full transition-all ${
                i < state.voteCount ? "bg-neon" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

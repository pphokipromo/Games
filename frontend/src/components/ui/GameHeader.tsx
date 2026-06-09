// src/components/ui/GameHeader.tsx
"use client";

import { useGame } from "@/hooks/useGame";

const PHASE_LABELS: Record<string, string> = {
  question: "📝 Jawab Pertanyaan",
  discussion: "💬 Diskusi",
  voting: "🗳️ Voting",
  round_result: "📊 Hasil Ronde",
  game_over: "🏆 Hasil Akhir",
};

export default function GameHeader() {
  const { state } = useGame();

  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs text-muted">
          Ronde {state.round}/{state.totalRounds}
        </p>
        <p className="font-semibold text-sm text-text-primary">
          {PHASE_LABELS[state.phase] || state.phase}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {state.room?.players.map(p => (
          <div
            key={p.id}
            className={`w-8 h-8 rounded-full bg-surface border flex items-center justify-center text-base transition-all ${
              p.id === state.myId ? "border-accent scale-110" : "border-border"
            }`}
            title={p.username}
          >
            {p.avatar}
          </div>
        ))}
      </div>
    </div>
  );
}

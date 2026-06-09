// src/components/game/QuestionPhase.tsx
"use client";

import { useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import TimerBar from "@/components/ui/TimerBar";
import GameHeader from "@/components/ui/GameHeader";
import type { ChatMessage } from "@/types/game";

interface Props {
  chatMessages: ChatMessage[];
}

export default function QuestionPhase({ chatMessages }: Props) {
  const { state, submitAnswer } = useGame();
  const [answer, setAnswer] = useState("");
  const { timeLeft, percentage, isUrgent } = useTimer(60);

  const handleSubmit = () => {
    if (!answer.trim() || state.hasAnswered) return;
    submitAnswer(answer.trim());
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 animate-fade-in">
      <GameHeader />
      <TimerBar percentage={percentage} timeLeft={timeLeft} isUrgent={isUrgent} label="Waktu Menjawab" />

      {/* Mission reminder */}
      {state.myMission && (
        <div className="mission-card rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <span className="text-xl">🎯</span>
          <div className="min-w-0">
            <p className="text-xs text-muted mb-0.5">Misimu:</p>
            <p className="text-sm text-accent-light font-medium leading-snug">{state.myMission.text}</p>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="card mb-4 glow-accent">
        <p className="text-xs text-muted mb-2 uppercase tracking-wider">Pertanyaan Ronde {state.round}</p>
        <p className="text-lg font-semibold text-text-primary leading-snug">
          {state.currentQuestion}
        </p>
      </div>

      {/* Answer input */}
      {!state.hasAnswered ? (
        <div className="space-y-3">
          <textarea
            className="input-field resize-none"
            rows={4}
            placeholder="Tulis jawabanmu di sini..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            maxLength={300}
            disabled={state.hasAnswered}
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{wordCount} kata</span>
            <span>{answer.length}/300</span>
          </div>
          <button
            className="btn-primary w-full py-4 text-base"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Kirim Jawaban ✉️
          </button>
        </div>
      ) : (
        <div className="card border-success/40 glow-success text-center py-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-semibold text-success">Jawaban terkirim!</p>
          <p className="text-sm text-muted mt-1 italic">"{state.myAnswer}"</p>
        </div>
      )}

      {/* Answer progress */}
      <div className="mt-4 card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted">Sudah menjawab</p>
          <p className="text-xs font-semibold text-accent-light">
            {state.answerCount} / {state.room?.players.length ?? 0}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {state.room?.players.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 min-w-[16px] rounded-full transition-all ${
                i < state.answerCount ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

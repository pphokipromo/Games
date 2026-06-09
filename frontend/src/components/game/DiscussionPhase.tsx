// src/components/game/DiscussionPhase.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import TimerBar from "@/components/ui/TimerBar";
import GameHeader from "@/components/ui/GameHeader";
import type { ChatMessage } from "@/types/game";

interface Props {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const EMOJIS = ["😂", "🤔", "😱", "👀", "🙄", "🤥", "👏", "🔥"];

export default function DiscussionPhase({ chatMessages, setChatMessages }: Props) {
  const { state, sendChat } = useGame();
  const [text, setText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { timeLeft, percentage, isUrgent } = useTimer(45);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendChat(text.trim());
    setText("");
  };

  const sendEmoji = (emoji: string) => {
    sendChat(emoji);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen px-4 py-4 animate-fade-in">
      <GameHeader />
      <TimerBar percentage={percentage} timeLeft={timeLeft} isUrgent={isUrgent} label="Waktu Diskusi" />

      {/* Answers revealed */}
      <div className="card mb-3 max-h-40 overflow-y-auto">
        <p className="text-xs text-muted mb-2 uppercase tracking-wider">📋 Jawaban Semua Pemain</p>
        <div className="space-y-2">
          {state.room?.players.map(player => (
            <div key={player.id} className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{player.avatar}</span>
              <div className="min-w-0">
                <span className="text-xs text-muted">{player.username}:</span>
                <p className="text-sm text-text-primary break-words">
                  {state.answers[player.id] || <em className="text-muted">tidak menjawab</em>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission reminder */}
      {state.myMission && (
        <div className="mission-card rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-xs text-accent-light">{state.myMission.text}</p>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 card overflow-hidden flex flex-col min-h-0">
        <p className="text-xs text-muted mb-2 pb-2 border-b border-border uppercase tracking-wider flex-shrink-0">
          💬 Diskusi
        </p>
        <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
          {chatMessages.length === 0 && (
            <p className="text-muted text-sm text-center py-4">Belum ada pesan. Mulai diskusi!</p>
          )}
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`chat-bubble flex items-start gap-2 ${msg.playerId === state.myId ? "flex-row-reverse" : ""}`}
            >
              <span className="text-lg flex-shrink-0">{msg.avatar}</span>
              <div className={`max-w-[75%] ${msg.playerId === state.myId ? "items-end" : "items-start"} flex flex-col`}>
                <span className="text-xs text-muted mb-0.5">
                  {msg.playerId === state.myId ? "Kamu" : msg.username}
                </span>
                <div
                  className={`px-3 py-2 rounded-xl text-sm break-words ${
                    msg.playerId === state.myId
                      ? "bg-accent text-white rounded-tr-sm"
                      : "bg-surface text-text-primary rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Emoji row */}
        <div className="flex gap-1 mb-2 flex-shrink-0">
          {EMOJIS.map(e => (
            <button
              key={e}
              className="flex-1 py-1 rounded-lg bg-surface hover:bg-border transition-colors text-base"
              onClick={() => sendEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <input
            className="input-field flex-1 py-2 text-sm"
            placeholder="Tulis pesan..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            maxLength={200}
          />
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={handleSend}
            disabled={!text.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

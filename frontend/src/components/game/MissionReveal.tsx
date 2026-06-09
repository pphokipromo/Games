// src/components/game/MissionReveal.tsx
"use client";

import { useEffect, useState } from "react";
import type { Mission } from "@/types/game";

interface Props {
  mission: Mission;
  onClose: () => void;
}

const missionTypeStyle: Record<string, { color: string; icon: string; label: string }> = {
  social: { color: "text-neon", icon: "🤝", label: "Sosial" },
  stealth: { color: "text-accent-light", icon: "👻", label: "Stealth" },
  word: { color: "text-gold", icon: "💬", label: "Kata" },
  bold: { color: "text-danger", icon: "🎯", label: "Bold" },
};

export default function MissionReveal({ mission, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const style = missionTypeStyle[mission.type] || { color: "text-accent-light", icon: "🎯", label: "Misi" };

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`mission-card w-full max-w-sm p-6 rounded-2xl text-center transition-all duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-xs uppercase tracking-widest text-muted mb-3">Misi Rahasia Kamu</div>

        <div className="text-5xl mb-3">{style.icon}</div>

        <span className={`badge bg-accent/20 ${style.color} border border-accent/30 mb-4`}>
          {style.label}
        </span>

        <div className="bg-surface/80 rounded-xl px-4 py-4 mb-5">
          <p className="text-text-primary font-semibold leading-relaxed text-base">
            {mission.text}
          </p>
        </div>

        <div className="text-xs text-muted bg-ink/50 rounded-lg px-3 py-2 mb-5">
          ⚠️ Jangan biarkan pemain lain tahu misi kamu!
        </div>

        <button
          className="btn-primary w-full"
          onClick={onClose}
        >
          Siap! Mulai Bermain 🚀
        </button>

        <p className="text-xs text-muted mt-3">Klik di luar untuk tutup</p>
      </div>
    </div>
  );
}

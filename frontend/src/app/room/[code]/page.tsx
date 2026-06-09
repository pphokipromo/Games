// src/app/room/[code]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import GameScreen from "@/components/game/GameScreen";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const { state, setReady, startGame, onGameAborted } = useGame();
  const [startError, setStartError] = useState("");
  const [abortMsg, setAbortMsg] = useState("");
  const [missionRevealed, setMissionRevealed] = useState(false);

  useEffect(() => {
    if (!state.room && state.phase === "lobby") {
      router.replace("/");
    }
  }, [state.room, state.phase, router]);

  useEffect(() => {
    const unsub = onGameAborted((reason) => setAbortMsg(reason));
    return unsub;
  }, [onGameAborted]);

  useEffect(() => {
    if (state.phase !== "lobby") setMissionRevealed(false);
  }, [state.phase]);

  const handleStart = async () => {
    setStartError("");
    try {
      await startGame();
    } catch (e: any) {
      setStartError(e.message);
    }
  };

  const myPlayer = state.room?.players.find(p => p.id === state.myId);
  const isHost = state.room?.hostId === state.myId;
  const allReady = state.room?.players.every(p => p.ready) && (state.room?.players.length ?? 0) >= 3;

  if (abortMsg) {
    return (
      <main className="min-h-screen bg-animated flex items-center justify-center px-4">
        <div className="card text-center max-w-sm w-full">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-xl font-bold mb-2">Game Dihentikan</h2>
          <p className="text-text-secondary mb-6">{abortMsg}</p>
          <button className="btn-primary w-full" onClick={() => router.push("/")}>Kembali ke Home</button>
        </div>
      </main>
    );
  }

  if (state.phase !== "lobby") {
    return <GameScreen />;
  }

  return (
    <main className="min-h-screen bg-animated flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in">
        <p className="text-xs text-muted uppercase tracking-widest mb-1">Kode Room</p>
        <div className="room-code">{code}</div>
        <p className="text-xs text-muted mt-2">Bagikan kode ini ke teman-temanmu</p>
      </div>

      {/* Player count */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-text-secondary text-sm">
          Pemain ({state.room?.players.length ?? 0}/10)
        </h2>
        <span className={`badge ${(state.room?.players.length ?? 0) >= 3 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
          {(state.room?.players.length ?? 0) >= 3 ? "✓ Siap mulai" : `Min 3 pemain`}
        </span>
      </div>

      {/* Player list */}
      <div className="space-y-2 mb-6">
        {state.room?.players.map(player => (
          <div
            key={player.id}
            className={`flex items-center gap-3 card py-3 transition-all ${
              player.id === state.myId ? "border-accent/50 glow-accent" : ""
            }`}
          >
            <div className="player-avatar">{player.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {player.username}
                {player.id === state.myId && <span className="text-accent-light text-xs ml-1">(Kamu)</span>}
              </p>
              {state.room?.hostId === player.id && (
                <p className="text-xs text-gold">👑 Host</p>
              )}
            </div>
            <span className={`badge ${player.ready ? "bg-success/20 text-success" : "bg-muted/20 text-muted"}`}>
              {player.ready ? "✓ Ready" : "Menunggu"}
            </span>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 3 - (state.room?.players.length ?? 0)) }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 card py-3 opacity-30">
            <div className="player-avatar border-dashed">👤</div>
            <p className="text-muted text-sm">Menunggu pemain...</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            myPlayer?.ready
              ? "bg-success/20 text-success border border-success/30"
              : "btn-secondary"
          }`}
          onClick={() => setReady(!myPlayer?.ready)}
        >
          {myPlayer?.ready ? "✓ Sudah Ready — Klik untuk Batal" : "Tandai Siap"}
        </button>

        {isHost && (
          <>
            <button
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              onClick={handleStart}
              disabled={!allReady}
            >
              🚀 Mulai Game!
            </button>
            {!allReady && (
              <p className="text-xs text-muted text-center">
                {(state.room?.players.length ?? 0) < 3
                  ? "Butuh minimal 3 pemain"
                  : "Tunggu semua pemain ready"}
              </p>
            )}
          </>
        )}

        {!isHost && (
          <p className="text-center text-muted text-sm py-2">
            ⏳ Menunggu host memulai game...
          </p>
        )}

        {startError && (
          <p className="text-danger text-sm text-center bg-danger/10 border border-danger/20 rounded-xl px-4 py-2">
            {startError}
          </p>
        )}
      </div>

      {/* How to play */}
      <div className="mt-8 card bg-surface">
        <h3 className="font-semibold text-sm mb-3 text-accent-light">🎮 Cara Bermain</h3>
        <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
          <li>Setiap ronde, kamu dapat <strong className="text-text-primary">misi rahasia</strong></li>
          <li>Jawab pertanyaan & selesaikan misi tanpa ketahuan</li>
          <li>Diskusi & cari pemain yang paling mencurigakan</li>
          <li>Vote siapa yang paling dicurigai</li>
          <li>Misi berhasil = +100 poin!</li>
        </ol>
      </div>
    </main>
  );
}

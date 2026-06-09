// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { connectSocket } from "@/lib/socket";
import { useGame } from "@/hooks/useGame";

export default function HomePage() {
  const router = useRouter();
  const { createRoom, joinRoom } = useGame();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    connectSocket();
    const saved = localStorage.getItem("smo_username");
    if (saved) setUsername(saved);
  }, []);

  const saveUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem("smo_username", name);
  };

  const handleCreate = async () => {
    if (!username.trim()) return setError("Masukkan username terlebih dahulu.");
    setError("");
    setLoading(true);
    try {
      const room = await createRoom(username.trim());
      router.push(`/room/${room.code}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) return setError("Masukkan username terlebih dahulu.");
    if (!roomCode.trim() || roomCode.length < 6) return setError("Masukkan kode room yang valid (6 karakter).");
    setError("");
    setLoading(true);
    try {
      const room = await joinRoom(roomCode.toUpperCase().trim(), username.trim());
      router.push(`/room/${room.code}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-animated flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="text-6xl mb-4">🕵️</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-accent-light via-neon to-accent bg-clip-text text-transparent">
          Secret Mission
        </h1>
        <p className="text-xl font-bold text-accent-light mt-1">Online</p>
        <p className="text-text-secondary mt-3 text-sm max-w-xs mx-auto">
          Game multiplayer real-time. Selesaikan misi rahasiamu tanpa ketahuan pemain lain.
        </p>
      </div>

      <div className="w-full max-w-sm animate-scale-in">
        {mode === "home" && (
          <div className="space-y-3">
            <div className="card mb-4">
              <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wider">Username kamu</label>
              <input
                className="input-field"
                placeholder="Masukkan nama..."
                value={username}
                onChange={e => saveUsername(e.target.value)}
                maxLength={20}
              />
            </div>

            <button
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              onClick={() => { if (!username.trim()) { setError("Masukkan username!"); return; } setError(""); setMode("create"); }}
            >
              <span>➕</span> Buat Room Baru
            </button>

            <button
              className="btn-secondary w-full flex items-center justify-center gap-2 text-lg py-4"
              onClick={() => { if (!username.trim()) { setError("Masukkan username!"); return; } setError(""); setMode("join"); }}
            >
              <span>🚪</span> Gabung Room
            </button>

            {error && <p className="text-danger text-sm text-center bg-danger/10 border border-danger/20 rounded-xl px-4 py-2">{error}</p>}

            <div className="text-center text-muted text-xs mt-6 space-y-1">
              <p>👥 3–10 pemain per room</p>
              <p>🎯 5 ronde dengan misi rahasia</p>
              <p>⚡ Real-time via Socket.IO</p>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-3 animate-slide-up">
            <div className="card">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🧑</span>
                <span className="font-semibold">{username}</span>
                <button onClick={() => setMode("home")} className="ml-auto text-muted hover:text-text-primary text-sm">ubah</button>
              </div>
              <p className="text-xs text-muted">Kamu akan menjadi host room ini.</p>
            </div>

            <button
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? <span className="animate-spin">⚙️</span> : <span>🚀</span>}
              {loading ? "Membuat room..." : "Buat Room Sekarang"}
            </button>
            <button className="btn-secondary w-full" onClick={() => { setMode("home"); setError(""); }}>
              ← Kembali
            </button>
            {error && <p className="text-danger text-sm text-center bg-danger/10 border border-danger/20 rounded-xl px-4 py-2">{error}</p>}
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-3 animate-slide-up">
            <div className="card">
              <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wider">Kode Room (6 karakter)</label>
              <input
                className="input-field text-center text-2xl font-mono font-bold tracking-widest uppercase"
                placeholder="XK92A1"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
              />
            </div>

            <button
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
              onClick={handleJoin}
              disabled={loading || roomCode.length < 6}
            >
              {loading ? <span className="animate-spin">⚙️</span> : <span>🚪</span>}
              {loading ? "Bergabung..." : "Gabung Room"}
            </button>
            <button className="btn-secondary w-full" onClick={() => { setMode("home"); setError(""); setRoomCode(""); }}>
              ← Kembali
            </button>
            {error && <p className="text-danger text-sm text-center bg-danger/10 border border-danger/20 rounded-xl px-4 py-2">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

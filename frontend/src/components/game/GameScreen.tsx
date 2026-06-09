// src/components/game/GameScreen.tsx
"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import MissionReveal from "./MissionReveal";
import QuestionPhase from "./QuestionPhase";
import DiscussionPhase from "./DiscussionPhase";
import VotingPhase from "./VotingPhase";
import RoundResult from "./RoundResult";
import FinalResult from "./FinalResult";

export default function GameScreen() {
  const { state, onChatMessage } = useGame();
  const [chatMessages, setChatMessages] = useState(state.room?.chatMessages || []);
  const [showMission, setShowMission] = useState(false);
  const [missionTimer, setMissionTimer] = useState<NodeJS.Timeout | null>(null);

  // Show mission card at start of each question phase
  useEffect(() => {
    if (state.phase === "question" && state.myMission) {
      setShowMission(true);
      const t = setTimeout(() => setShowMission(false), 5000);
      setMissionTimer(t);
    }
    return () => { if (missionTimer) clearTimeout(missionTimer); };
  }, [state.round]);

  useEffect(() => {
    if (state.room?.chatMessages) {
      setChatMessages(state.room.chatMessages);
    }
  }, [state.room?.chatMessages]);

  useEffect(() => {
    const unsub = onChatMessage(msg => {
      setChatMessages(prev => [...prev, msg]);
    });
    return unsub;
  }, [onChatMessage]);

  const { phase } = state;

  return (
    <main className="min-h-screen bg-animated flex flex-col max-w-lg mx-auto">
      {/* Mission overlay */}
      {showMission && state.myMission && (
        <MissionReveal mission={state.myMission} onClose={() => setShowMission(false)} />
      )}

      {phase === "question" && (
        <QuestionPhase chatMessages={chatMessages} />
      )}
      {phase === "discussion" && (
        <DiscussionPhase chatMessages={chatMessages} setChatMessages={setChatMessages} />
      )}
      {phase === "voting" && (
        <VotingPhase />
      )}
      {phase === "round_result" && (
        <RoundResult />
      )}
      {phase === "game_over" && (
        <FinalResult />
      )}
    </main>
  );
}

// src/types/game.ts

export type GamePhase =
  | "lobby"
  | "mission"
  | "question"
  | "discussion"
  | "voting"
  | "round_result"
  | "game_over";

export interface Player {
  id: string;
  username: string;
  avatar: string;
  ready: boolean;
  score: number;
}

export interface Mission {
  id: string;
  text: string;
  type: string;
}

export interface ChatMessage {
  id: string | number;
  playerId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface Room {
  code: string;
  hostId: string;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  players: Player[];
  currentQuestion: string | null;
  answerCount: number;
  voteCount: number;
  chatMessages: ChatMessage[];
}

export interface RoundResult {
  playerId: string;
  username: string;
  avatar: string;
  mission: string;
  missionSuccess: boolean;
  voteCount: number;
  isMostVoted: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface FinalScore {
  playerId: string;
  username: string;
  avatar: string;
  score: number;
  missionSuccesses: number;
}

export interface GameState {
  room: Room | null;
  myId: string | null;
  myMission: Mission | null;
  currentQuestion: string | null;
  answers: Record<string, string>;
  votes: Record<string, string>;
  roundResults: RoundResult[];
  finalScores: FinalScore[];
  phase: GamePhase;
  round: number;
  totalRounds: number;
  answerCount: number;
  voteCount: number;
  myAnswer: string;
  myVote: string | null;
  hasAnswered: boolean;
  hasVoted: boolean;
}

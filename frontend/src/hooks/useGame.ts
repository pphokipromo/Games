// src/hooks/useGame.ts
"use client";

import { useEffect, useCallback, useReducer, useRef } from "react";
import { connectSocket, getSocket } from "@/lib/socket";
import type { GameState, Room, Mission, RoundResult, FinalScore, ChatMessage } from "@/types/game";

type Action =
  | { type: "SET_ROOM"; room: Room }
  | { type: "SET_MY_ID"; id: string }
  | { type: "SET_MISSION"; mission: Mission }
  | { type: "SET_QUESTION"; question: string; round: number; totalRounds: number }
  | { type: "SET_PHASE"; phase: GameState["phase"] }
  | { type: "SET_ANSWER_COUNT"; count: number; total: number }
  | { type: "SET_VOTE_COUNT"; count: number; total: number }
  | { type: "SET_DISCUSSION"; answers: Record<string, string> }
  | { type: "SET_VOTING"; players: Room["players"] }
  | { type: "SET_ROUND_RESULTS"; results: RoundResult[] }
  | { type: "SET_FINAL_SCORES"; scores: FinalScore[] }
  | { type: "MY_ANSWER_SUBMITTED"; answer: string }
  | { type: "MY_VOTE_SUBMITTED"; targetId: string }
  | { type: "RESET" };

const initialState: GameState = {
  room: null,
  myId: null,
  myMission: null,
  currentQuestion: null,
  answers: {},
  votes: {},
  roundResults: [],
  finalScores: [],
  phase: "lobby",
  round: 0,
  totalRounds: 5,
  answerCount: 0,
  voteCount: 0,
  myAnswer: "",
  myVote: null,
  hasAnswered: false,
  hasVoted: false,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_ROOM":
      return {
        ...state,
        room: action.room,
        phase: action.room.phase,
        round: action.room.round,
        totalRounds: action.room.totalRounds,
      };
    case "SET_MY_ID":
      return { ...state, myId: action.id };
    case "SET_MISSION":
      return { ...state, myMission: action.mission };
    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.question,
        round: action.round,
        totalRounds: action.totalRounds,
        hasAnswered: false,
        hasVoted: false,
        myAnswer: "",
        myVote: null,
        answers: {},
        votes: {},
        roundResults: [],
        answerCount: 0,
        voteCount: 0,
        phase: "question",
      };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_ANSWER_COUNT":
      return { ...state, answerCount: action.count };
    case "SET_VOTE_COUNT":
      return { ...state, voteCount: action.count };
    case "SET_DISCUSSION":
      return { ...state, answers: action.answers, phase: "discussion" };
    case "SET_VOTING":
      return { ...state, phase: "voting" };
    case "SET_ROUND_RESULTS":
      return { ...state, roundResults: action.results, phase: "round_result" };
    case "SET_FINAL_SCORES":
      return { ...state, finalScores: action.scores, phase: "game_over" };
    case "MY_ANSWER_SUBMITTED":
      return { ...state, hasAnswered: true, myAnswer: action.answer };
    case "MY_VOTE_SUBMITTED":
      return { ...state, hasVoted: true, myVote: action.targetId };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = connectSocket();
    dispatch({ type: "SET_MY_ID", id: socket.id || "" });

    socket.on("connect", () => {
      dispatch({ type: "SET_MY_ID", id: socket.id || "" });
    });

    socket.on("roomUpdated", ({ room }: { room: Room }) => {
      dispatch({ type: "SET_ROOM", room });
    });

    socket.on("playerJoined", ({ room }: { room: Room }) => {
      dispatch({ type: "SET_ROOM", room });
    });

    socket.on("playerLeft", ({ room }: { room: Room }) => {
      dispatch({ type: "SET_ROOM", room });
    });

    socket.on("sendMission", ({ mission }: { mission: Mission }) => {
      dispatch({ type: "SET_MISSION", mission });
    });

    socket.on("sendQuestion", ({ question, round, totalRounds }: { question: string; round: number; totalRounds: number }) => {
      dispatch({ type: "SET_QUESTION", question, round, totalRounds });
    });

    socket.on("answerCountUpdated", ({ count, total }: { count: number; total: number }) => {
      dispatch({ type: "SET_ANSWER_COUNT", count, total });
    });

    socket.on("startDiscussion", ({ answers }: { answers: Record<string, string> }) => {
      dispatch({ type: "SET_DISCUSSION", answers });
    });

    socket.on("startVoting", () => {
      dispatch({ type: "SET_VOTING", players: [] });
    });

    socket.on("voteCountUpdated", ({ count, total }: { count: number; total: number }) => {
      dispatch({ type: "SET_VOTE_COUNT", count, total });
    });

    socket.on("roundResult", ({ results }: { results: RoundResult[] }) => {
      dispatch({ type: "SET_ROUND_RESULTS", results });
    });

    socket.on("endGame", ({ finalScores }: { finalScores: FinalScore[] }) => {
      dispatch({ type: "SET_FINAL_SCORES", scores: finalScores });
    });

    socket.on("phaseChanged", ({ phase }: { phase: GameState["phase"] }) => {
      dispatch({ type: "SET_PHASE", phase });
    });

    return () => {
      socket.off("connect");
      socket.off("roomUpdated");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("sendMission");
      socket.off("sendQuestion");
      socket.off("answerCountUpdated");
      socket.off("startDiscussion");
      socket.off("startVoting");
      socket.off("voteCountUpdated");
      socket.off("roundResult");
      socket.off("endGame");
      socket.off("phaseChanged");
    };
  }, []);

  const createRoom = useCallback((username: string): Promise<Room> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("createRoom", { username }, (res: { room?: Room; error?: string }) => {
        if (res.error) return reject(new Error(res.error));
        dispatch({ type: "SET_ROOM", room: res.room! });
        resolve(res.room!);
      });
    });
  }, []);

  const joinRoom = useCallback((code: string, username: string): Promise<Room> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("joinRoom", { code, username }, (res: { room?: Room; error?: string }) => {
        if (res.error) return reject(new Error(res.error));
        dispatch({ type: "SET_ROOM", room: res.room! });
        resolve(res.room!);
      });
    });
  }, []);

  const setReady = useCallback((isReady: boolean) => {
    getSocket().emit("playerReady", { isReady });
  }, []);

  const startGame = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      getSocket().emit("startGame", {}, (res: { ok?: boolean; error?: string }) => {
        if (res?.error) return reject(new Error(res.error));
        resolve();
      });
    });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    getSocket().emit("submitAnswer", { answer });
    dispatch({ type: "MY_ANSWER_SUBMITTED", answer });
  }, []);

  const sendChat = useCallback((text: string) => {
    getSocket().emit("sendChat", { text });
  }, []);

  const submitVote = useCallback((targetId: string) => {
    getSocket().emit("submitVote", { targetId });
    dispatch({ type: "MY_VOTE_SUBMITTED", targetId });
  }, []);

  const onChatMessage = useCallback((cb: (msg: ChatMessage) => void) => {
    const socket = getSocket();
    socket.on("newChatMessage", ({ message }: { message: ChatMessage }) => cb(message));
    return () => socket.off("newChatMessage");
  }, []);

  const onGameAborted = useCallback((cb: (reason: string) => void) => {
    const socket = getSocket();
    socket.on("gameAborted", ({ reason }: { reason: string }) => cb(reason));
    return () => socket.off("gameAborted");
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    createRoom,
    joinRoom,
    setReady,
    startGame,
    submitAnswer,
    sendChat,
    submitVote,
    onChatMessage,
    onGameAborted,
    reset,
  };
}

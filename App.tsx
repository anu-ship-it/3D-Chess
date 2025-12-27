import React, { useState, useMemo } from "react";
import { Chess, Square, Move } from "chess.js";
import ThreeChess from "./components/ThreeChess";
import { getChessHint } from "./services/geminiService";
import { GameStatus, GameStatus } from "./types";
import { RefreshCw, Zap, Award, X, Rotate3D } from "lucide-react";

const App = () => {
    // Game Logic State
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null);
    const [GameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
    const [boardView, setBoardView] = useState<'white' | 'black'>('white');

    // AI Advisor State
    
}
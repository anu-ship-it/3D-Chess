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
    const [hint, setHint] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [showHintModel, setShowHintModal] = useState(false);

    // Derived Board State
    const boardState = useMemo(() => {
        return game.board();
    }, [fen]);

    // Handle Square Click
    const onSquareClick = (square: Square) => {
        if (game.isGameOver()) return;

        // 1. Attempting to Move?
        if (selectedSquare && validMoves.includes(square)) {
            try {
                const move = game.move({
                    from: selectedSquare,
                    to: square,
                    promotion: 'q',
                });

                if (move) {
                    setFen(game.fen());
                    setLastMove({ from: move.from, to: move.to });
                    setSelectedSquare(null);
                    setValidMoves([]);
                    checkGameStatus();
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }

        // 2. Select Piece
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            setSelectedSquare(square);
            const moves = game.moves({ square, verbose: true }) as Move[];
            setValidMoves(moves.map(m => m.to));
        } else {
            setSelectedSquare(null);
            setValidMoves([]);
        }
    };

    const checkGameStatus = () => {
        if (game.isCheckmate()) setGameStatus(GameStatus.CHECKMATE);
        else if (game.isDraw()) setGameStatus(GameStatus.DRAW);
        else if (game.isStalemate()) setGameStatus(GameStatus.STALEMATE);
        else setGameStatus(GameStatus.PLAYING);
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setSelectedSquare(null);
        setValidMoves([]);
        setLastMove(null);
        setGameStatus(GameStatus.PLAYING);
        setHint(null);
        setBoardView('white');
    };

    const handleGetHint = async () => {
        if (isThinking) return;
        setIsThinking(true);
        setHint(null);
        setShowHintModal(true);

        const advice = await getChessHint(fen, game.turn());
        setHint(advice);
        setIsThinking(false);
    };

    const toggleView = () => {
        setBoardView(prev => prev === 'white' ? 'black' : 'white');
    };

    return (
        <div className="w-full h-screen relative flex flex-col bg-neutral-900 text-white overflow-hidden font-sans">

            {/* 3D Scene Layer */}
            <div className="absolute inset-0 z-0">
                <ThreeChess
                    boardState={boardState}
                    fen={fen}
                    selectedSquare={selectedSquare}
                    validMoves={validMoves}
                    lastMove={lastMove}
                    onSquareClick={onSquareClick}
                    turn={game.turn()}
                    view={boardView}
                />    
            </div>

            {/* HUD Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
                {/* Header */}
                <div className="pointer-events-auto bg-black/20 backdrop-blur-x1 p-4 rounded-2x1 border border-white/5 shadow-2x1">
                <h1 className="text"></h1>

                </div>
            </div>

        </div>
    )
}
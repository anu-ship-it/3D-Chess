import { Square, PieceSymbol, Color } from 'chess.js';

export interface BoardProps {
    fen: string;
    onMove: (from: Square, to: Square) => void;
    validMoves: Square[];
    selectedSquare: Square | null;
    onselectedSquare: (square: Square | null) => void;
    lastMove: { from: Square; to: Square } | null;
}


import { Square, PieceSymbol, Color } from 'chess.js';

export interface BoardProps {
    fen: string;
    onMove: (from: Square, to: Square) => void;
}
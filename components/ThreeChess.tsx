import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, MeshReflectorMaterial, Float, Stars } from '@react-three/drei';
import { Square, Color, PieceSymbol } from 'chess.js';
import * as Pieces from './ChessPieces';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// --- Constrants ---
const BOARD_SIZE = 8;
const SQUARE_SIZE = 1.2;
const BOARD_OFFSET = (BOARD_SIZE * SQUARE_SIZE) / 2 - SQUARE_SIZE / 2;

// --- Helpers ---

const getPosition = (square: Square): [number, number, number] => {
    const file = square.charCodeAt(0) - 97; // a=0
    const rank = parseInt(square[1]) - 1; // 1=0

    const x = file * SQUARE_SIZE - BOARD_OFFSET;
    const z = -(rank * SQUARE_SIZE - BOARD_OFFSET);

    return [x, 0, z];
};

const getDistance = (sq1: Square, sq2: Square) => {
    const f1 = sq1.charCodeAt(0);
    const r1 = parseInt(sq1[1]);
    const f2 = sq2.charCodeAt(0);
    const r2 = parseInt(sq2[1]);
    return Math.sqrt(Math.pow(f1 - f2, 2) + Math.pow(r1 - r2, 2));
};

const generateId = (type: string, color: string) => `${color}-${type}-${Math.random().toString(36).substring(2, 9)}`;

// --- Piece Tracking Hook ---
// This ensure that when a piece moves, we reuse the same React component (key)
// so the animation library can interpolate the position changes smoothly.
const usePieceTracking = (
    boardState: ({ type: PieceSymbol, color: Color, square: Square } | null)[][],
    LastMove: { from: Square, to: Square } | null
) => {
    const prevPieceRef = useRef<Record<string, { square: Square, type: PieceSymbol, color: Color }>>({});

    const trackedPieces = useMemo(() => {
        // 1. Flatten current board state
        const newPieces: { square: Square, type: PieceSymbol, color: Color }[] = [];
        boardState.forEach(row => row.forEach(p => {
            if(p) newPieces.push(p);
        }));

        
    })
}
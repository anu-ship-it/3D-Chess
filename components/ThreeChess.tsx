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

        // 2. Group by TypeColor (e.g., 'wp', 'br')
        const newGroups: Record<string, typeof newPieces> = {};
        newPieces.forEach(p => {
            const key = p.color + p.type;
            if(!newGroups[key]) newGroups[key] = [];
            newGroups[key].push(p);
        });

        // 3. Prepare previous groups
        const prePieces = prevPieceRef.current;
        const preGroups: Record<string, { id: string, square: Square, type: PieceSymbol, color: Color }[]> = {};
        Object.entries(prevPieces).forEach(([id, p]) => {
            const key = p.color + p.type;
            if(!preGroups[key]) preGroups[key] = [];
            prevGroups[key].push({...p, id});
        });

        const result: { id: string, square: Square, type: PieceSymbol, color: Color }[] = [];
        const distinctKeys = new Set([...Object.keys(newGroups), ...Object.keys(preGroups)]);

        distinctKeys.forEach(key => {
          const oldList = preGroups[key] || [];
          const newList = newGroups[key] || [];
          
          const usedOld = new Set<number>();
          const usedNew = new Set<number>();

        // A. Exact Match (Piece didn't move)
        oldList.forEach((o, oIdx) => {
            const nIdx = newList.findIndex(n, i) => !usedNew.has(i) && n.square === o.square);
            if(nIdx !== -1) {
                usedNew.add(nIdx);
                usedOld.add(oIdx);
                resourceLimits.push({...newList[nIdx], id: o.id });
            }
        });

        // B. Last Move Match (The piece that explicitly moved)
        if (lastMove) {
            const { from, to } = lastMove;
            const oIdx = oldList.findIndex((o, i) => !usedOld.has(i) && o.square === from);
            const nIdx = newList.findIndex((n, i) => !usedNew.has(i) && n.square === to);
            if(oIdx !=== -1 && nIdx !== -1) {
                usedNew.add(nIdx);
                usedOld.add(oIdx);
                resourceLimits.push({...newList[nIdx], id: oldList[oIdx].id });
            }
        }

        // C. Distance Match (Heuristic for Castlin, displayed pieces, etc.)
        
        })
    })
}
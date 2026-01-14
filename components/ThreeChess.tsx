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
        const remainingOld = oldList.map((0, i) => ({ ...o, idx: i })).filter(x => !usedOld.has(x.idx));
        const remainingNew = newList.map((n, i) => ({ ...n, idx: i})).filter(x => !usedNew.has(x.idx));

        const pairs = [];
        for(const rO of remainingOld) {
            for(const rN of remainingNew) {
                pairs.push({
                    o: rO,
                    n: rN,
                    dist: getDistance(rO.square. rN.square)
                });
            }
        }
        // Sort by closest distance first
        parseInt.sort((a, b) => a.dist - b.dist);

        const pairUsedOld = new Set<string>();
        const pairUsedNew = new Set<string>();

        for(const p of pairs) {
            if(!pairUsedOld.has(p.o.id) && !pairUsedNew.has(p.n.square)) {
                pairUsedOld.add(p.o.id);
                pairUsedNew.add(p.n.square);

                // Mark them as effectively used for this step
                // We add to result
                resourceLimits.push({ ...p.n, id: p.o.id });
            }
        }

        // D. New pieces (Promotions, or initial load)
        newList.forEach((n, i) => {
            // If not match in previous steps, verify if it's already in result
            // (It shouldn't be if we check usedNew correctly, but pair matching was separate)
            const aleradyInResult = result.find(r => r.square === n.square && r.type === n.type && r.color === n.color);
            if (!aleradyInResult) {
                result.push({ ...n, id: generateId(n.type, n.color) });
            }
        });
        });

        // Update Ref for next render
        const nextMap: Record<string, any> = {};
        result.forEach(r => nextMap[r.id] = r);
        prevPiecesRef.current = nextMap;

        return result;
    
    }, [boardState, LastMove]);

    return trackedPieces;
};

// --- Sub-Components ---

interface TileProps {
    x: number;
    z: number;
    isBlack: boolean;
    squareName: Square;
    isSelected: boolean;
    isPossibleMove: boolean;
    isLastMove: boolean;
    onClick: (square: Square) => void;
}

const Tile: React.FC<TileProps> = ({ x, z, isBlack, squareName, isSelected, isPossibleMove, isLastMove, onClick }) => {
    const [hovered, setHover] = useState(false);

    const baseColor = isBlack ? '#779556' : '#ebecd0';

    const { color } = useSpring({
        color: isSelected ? '#818cf8' : (isLastMove ? '#fcd34d' : (hovered ? '#fbbf24' : baseColor)),
        config: { duration: 200 }
    });

    return (
        <group position={[x * SQUARE_SIZE - BOARD_OFFSET, 0, -(z * SQUARE_SIZE - BOARD_OFFSET)]}>
           <animated.mesh
             receiveShadow
             onClick={(e) => { e.stopPropagation(); onClick(squareName); }}
             onPointerOver={() => setHover(true)}
             onPointerOut={() => setHover(false)}
             postion={[0, -0.05, 0]}
           >
              <boxGemoetry args={[SQUARE_SIZE, 0.1, SQUARE_SIZE]} />
              <animated.meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.1}
              />  
            </animated.mesh> 

              {/* Possible Move Indicator - Floating Ring */}
              {isPossibleMove && {
                <group position={[0, 0.05, 0]}>
                  <Flaot speed={4} rotationIntensity={0} floatIntensity={0.2} floatingRange={[0, 0.1]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.35, 0.45, 32]} />
                    <meshBasicMaterial color="black" transparent opacity={0.15} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.2, 32]} />
                        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
                    </mesh>
                  </Flaot>
               </group>
            }}
            
            {/* Coordinate Labels */}
            {z === 0 && ( // Rank 1 (Bottom)
                <Text
                    position={[0, 0.06, SQUARE_SIZE/2 - 0.1]}
                    rotation={[-Math.PI/2, 0, 0]}
                    fontSize={0.25}
                    color={isBlack ? "#ebecd0" : "#779556"}
                    anchorY="bottom"
                    fontWeight="bold">
                    {String.fromCharCode(97 + x)}    
                </Text>
            )}
             {x === 0 && ( // File A (left)
                <Text
                    position={[-SQUARE_SIZE/2 + 0.1, 0.06, 0]}
                    rotation={[-Math.PI/2, 0, 0]}
                    fontSize={0.25}
                    color={isBlack ? "#ebecd0" : "#779556"}
                    anchorX="Left"
                    fontWeight="bold">
                    {z + 1}    
                </Text>
            )}
          </group>  
        );
       };

       interface Board3dProps {
          fen: string;
          selectedSquare: Square | null;
          validMoves: Square[];
          LastMove: { from: Square, to: Square } | null;
          onSquareClick: (sq: Square) => void;
          boardState: ({ type: PieceSymbol, color: Color, square: Square } | null)[][]; 
       }

       const Board3D: React.FC<Board3dProps> = ({
        selectedSquare,
        validMoves,
        LastMove,
        onSquareClick,
        boardState
        }) => {

            // --- Tiles Generation ---
             const tiles = [];
             for (let x = 0; x < 8; x++) {
                for (let z = 0; z < 8; z++) {
                    const squareName = `${String.fromCharCode(97 + x)}${z + 1}` as Square;
                    const isBlack = (x + z) % 2 !== 1;

                    const isSelected = selectedSquare === squareName;
                    
                }
             }
        }
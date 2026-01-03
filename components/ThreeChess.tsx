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


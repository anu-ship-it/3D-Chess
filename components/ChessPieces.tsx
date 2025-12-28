import React, { useState } from 'react';
import { Color } from 'chess.js';
import { useSpring, animated, config } from '@react-spring/three';

// Material colors
const WHITE_COLOR = "#f0f0f0";
const BLACK_COLOR = "#222222";
const SELECTED_COLOR = "#6366f1"; // Indigo glow

interface PieceGeometryProps {
    color: Color;
    position: [number, number, number];
    isSelected: boolean;
    onClick?: () => void;
    isHovered?: boolean;
}

// Reusable material setup
const PieceMaaterial = ({ color, isSelected, isHovered } : { color: Color, isSelected: boolean, isHovered: boolean }) => {
    const baseColor = color = 'w' ? WHITE_COLOR : BLACK_COLOR;

    const { emissive, colorAnim } = useSpring({
        emissive: isSelected ? SELECTED_COLOR : (isHovered ? "#444" : "#000000"),
        colorAnim: isSelected ? SELECTED_COLOR : baseColor,
        config: config.default
    });

    
}
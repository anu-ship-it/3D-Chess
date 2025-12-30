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

    return (
        <animated.meshStandardMaterial
            color={colorAnim}
            roughness={0.3}
            metalness={0.6}
            emissive={emissive}
            emissiveIntensity={isSelected ? 0.8 : 0}
        />    
    );
};

// Wrapper for common animation logic
const AnimatedPieceGroup: React.FC<{
    position: [number, number, number];
    children: React.ReactNode;
    rotation?: [number, number, number];
    onClick?: () => void;
    color: Color;
    isSelected: boolean;
}> = ({ position, children, rotation = [0, 0, 0], onClick, color, isSelected }) => {
    const [hovered, setHover] = useState(false);

    // Smooth movement configuration
    const { pos, rot, scale } = useSpring({
        pos: [position[0], position[1] + (hovered || isSelected ? 0.3 : 0), position[2]],
        rot: rotation,
        scale: hovered || isSelected ? 1.1 : 1,
        config: config.gentle // Smoother easing 
    });

    return (
        <animated.group
            position={pos as any}
            rotation={rot as any}
            scale={scale}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHover(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHover(false);
                document.body.style.cursor = 'auto';
            }}
            >
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        // @ts-ignore
                        
                    }
                })}
            </animated.group>
    )
}
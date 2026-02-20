'use client';

/**
 * IntersectionPoint — Glowing sphere at the solution point.
 *
 * Rendered only when the system has a unique solution.
 * Features a pulsing animation and label showing coordinates.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface IntersectionPointProps {
    position: [number, number, number];
    label?: string;
}

export default function IntersectionPoint({
    position,
    label,
}: IntersectionPointProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // Pulsing glow animation
    useFrame((state) => {
        if (glowRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
            glowRef.current.scale.setScalar(scale);
        }
    });

    const formattedLabel =
        label ||
        `(${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)})`;

    return (
        <group position={position}>
            {/* Core sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshBasicMaterial
                    color="#a78bfa"
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Label */}
            <Html
                position={[0, 0.5, 0]}
                center
                style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <div
                    style={{
                        background: 'rgba(15, 15, 30, 0.85)',
                        color: '#e2e8f0',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    {formattedLabel}
                </div>
            </Html>
        </group>
    );
}

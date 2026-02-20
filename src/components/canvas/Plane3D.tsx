'use client';

/**
 * Plane3D — Individual plane mesh for the 3D visualization.
 *
 * Renders a semi-transparent plane with color coding per equation.
 * Position and rotation derived from the plane's normal vector and constant.
 * Animated smoothly on state changes via usePlaneAnimation.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { usePlaneAnimation } from '@/hooks/usePlaneAnimation';
import type { PlaneParams } from '@/lib/types/matrix';

interface Plane3DProps {
    plane: PlaneParams;
    index: number;
    isHighlighted?: boolean;
    showWireframe?: boolean;
    opacity?: number;
    size?: number;
}

export default function Plane3D({
    plane,
    index,
    isHighlighted = false,
    showWireframe = false,
    opacity = 0.5,
    size = 8,
}: Plane3DProps) {
    const { groupRef, isAnimating } = usePlaneAnimation({
        normal: plane.normal,
        constant: plane.constant,
    });

    const effectiveOpacity = isHighlighted ? 0.55 : opacity;
    const color = useMemo(() => new THREE.Color(plane.color), [plane.color]);

    // Don't render degenerate planes (zero normal)
    const normalLen = Math.sqrt(
        plane.normal[0] ** 2 + plane.normal[1] ** 2 + plane.normal[2] ** 2,
    );
    if (normalLen < 1e-10) return null;

    return (
        <group ref={groupRef}>
            {/* Main translucent plane - simple material without realistic light interactions */}
            <mesh>
                <planeGeometry args={[size, size, 1, 1]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={effectiveOpacity}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Wireframe overlay */}
            {showWireframe && (
                <mesh renderOrder={1}>
                    <planeGeometry args={[size, size, 1, 1]} />
                    <meshBasicMaterial
                        color={color}
                        wireframe
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}

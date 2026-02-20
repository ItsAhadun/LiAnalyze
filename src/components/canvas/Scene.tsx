'use client';

/**
 * Scene — Main React-Three-Fiber Canvas wrapper.
 *
 * Renders the 3D visualization with planes, intersection points,
 * orbit controls, grid, and axis helpers/labels.
 *
 * Must be dynamically imported with ssr: false.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useTheme } from 'next-themes';
import Plane3D from './Plane3D';
import IntersectionPoint from './IntersectionPoint';
import AxisLabels from './AxisLabels';
import type { PlaneParams } from '@/lib/types/matrix';

interface SceneProps {
    planes: PlaneParams[];
    intersectionPoint?: [number, number, number] | null;
    highlightedRow?: number | null;
    showWireframes?: boolean;
}

function SceneContent({ planes, intersectionPoint, highlightedRow, showWireframes = false }: SceneProps) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <directionalLight position={[-5, -5, -5]} intensity={0.3} />

            {/* Grid */}
            <Grid
                args={[20, 20]}
                position={[0, 0, 0]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#4a4a5a"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#6366f1"
                fadeDistance={25}
                fadeStrength={1}
                infiniteGrid
            />

            {/* Coordinate axes */}
            <axesHelper args={[6]} />
            <AxisLabels size={6} />

            {/* Planes */}
            {planes.map((plane, i) => (
                <Plane3D
                    key={i}
                    plane={plane}
                    index={i}
                    isHighlighted={highlightedRow === i}
                    showWireframe={showWireframes}
                />
            ))}

            {/* Intersection point (unique solution) */}
            {intersectionPoint && (
                <IntersectionPoint position={intersectionPoint} />
            )}

            {/* Camera controls */}
            <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.15}
                minDistance={3}
                maxDistance={30}
            />

            {/* Gizmo helper for orientation */}
            <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
                <GizmoViewport
                    axisColors={['#ef4444', '#22c55e', '#3b82f6']}
                    labelColor="white"
                />
            </GizmoHelper>
        </>
    );
}

export default function Scene({ planes, intersectionPoint, highlightedRow, showWireframes = false }: SceneProps) {
    const { resolvedTheme } = useTheme();
    const bgColor = resolvedTheme === 'dark' ? '#0a0a1a' : '#f0f0f5';

    return (
        <div className="h-full w-full relative rounded-xl overflow-hidden border border-white/10">
            <Canvas
                camera={{
                    position: [8, 6, 8],
                    fov: 50,
                    near: 0.1,
                    far: 100,
                }}
                style={{ background: bgColor }}
                gl={{ antialias: true, alpha: false }}
            >
                <SceneContent
                    planes={planes}
                    intersectionPoint={intersectionPoint}
                    highlightedRow={highlightedRow}
                    showWireframes={showWireframes}
                />
            </Canvas>

            {/* Canvas overlay info */}
            <div className="absolute bottom-3 left-3 text-xs text-white/40 font-mono pointer-events-none">
                Orbit: drag · Zoom: scroll · Pan: right-drag
            </div>
        </div>
    );
}

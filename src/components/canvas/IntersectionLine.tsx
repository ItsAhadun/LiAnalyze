'use client';

/**
 * IntersectionLine — Highlighted line for infinite-solutions case.
 *
 * Rendered when the system has infinitely many solutions forming a line.
 * Uses @react-three/drei's Line component for proper R3F integration.
 */

import { Line } from '@react-three/drei';

interface IntersectionLineProps {
    /** Start and end points of the line */
    start: [number, number, number];
    end: [number, number, number];
    color?: string;
    lineWidth?: number;
}

export default function IntersectionLine({
    start,
    end,
    color = '#fbbf24',
    lineWidth = 3,
}: IntersectionLineProps) {
    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={lineWidth}
            transparent
            opacity={0.9}
        />
    );
}

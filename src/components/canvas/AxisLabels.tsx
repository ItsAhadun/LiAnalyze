'use client';

/**
 * AxisLabels — x, y, z axis labels and colored axis lines.
 */

import { Text } from '@react-three/drei';

interface AxisLabelsProps {
    size?: number;
}

export default function AxisLabels({ size = 6 }: AxisLabelsProps) {
    const axisColor = {
        x: '#ef4444',
        y: '#22c55e',
        z: '#3b82f6',
    };

    return (
        <group>
            {/* X Axis Label */}
            <Text
                position={[size + 0.5, 0, 0]}
                fontSize={0.4}
                color={axisColor.x}
                anchorX="center"
                anchorY="middle"
            >
                x
            </Text>

            {/* Y Axis Label */}
            <Text
                position={[0, size + 0.5, 0]}
                fontSize={0.4}
                color={axisColor.y}
                anchorX="center"
                anchorY="middle"
            >
                y
            </Text>

            {/* Z Axis Label */}
            <Text
                position={[0, 0, size + 0.5]}
                fontSize={0.4}
                color={axisColor.z}
                anchorX="center"
                anchorY="middle"
            >
                z
            </Text>
        </group>
    );
}

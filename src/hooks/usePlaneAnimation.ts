'use client';

/**
 * Plane animation interpolation hook for React-Three-Fiber.
 *
 * Smoothly lerps plane position and rotation from old → new
 * over a configurable duration using useFrame.
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    computePlanePosition,
    computePlaneRotation,
} from '@/lib/math/plane-geometry';

interface PlaneAnimationTarget {
    normal: [number, number, number];
    constant: number;
}

interface UsePlaneAnimationOptions {
    /** Duration of the transition in milliseconds (default: 600) */
    duration?: number;
}

export function usePlaneAnimation(
    target: PlaneAnimationTarget,
    options: UsePlaneAnimationOptions = {},
) {
    const { duration = 600 } = options;

    const groupRef = useRef<THREE.Group>(null);
    const progressRef = useRef(1); // 1 = animation complete
    const startTimeRef = useRef(0);

    // Store previous and target transforms
    const prevPosition = useRef(new THREE.Vector3());
    const targetPosition = useRef(new THREE.Vector3());
    const prevQuaternion = useRef(new THREE.Quaternion());
    const targetQuaternion = useRef(new THREE.Quaternion());

    const [isAnimating, setIsAnimating] = useState(false);

    // When target changes, start a new animation
    useEffect(() => {
        const newPos = computePlanePosition(target.normal, target.constant);
        const newRot = computePlaneRotation(target.normal);

        const newTargetPos = new THREE.Vector3(...newPos);
        const newTargetEuler = new THREE.Euler(...newRot);
        const newTargetQuat = new THREE.Quaternion().setFromEuler(newTargetEuler);

        if (groupRef.current) {
            prevPosition.current.copy(groupRef.current.position);
            prevQuaternion.current.copy(groupRef.current.quaternion);
        } else {
            prevPosition.current.copy(newTargetPos);
            prevQuaternion.current.copy(newTargetQuat);
        }

        targetPosition.current.copy(newTargetPos);
        targetQuaternion.current.copy(newTargetQuat);

        progressRef.current = 0;
        startTimeRef.current = 0;
        setIsAnimating(true);
    }, [target.normal[0], target.normal[1], target.normal[2], target.constant]);

    // Animate each frame
    useFrame((_, delta) => {
        if (!groupRef.current || progressRef.current >= 1) return;

        if (startTimeRef.current === 0) {
            startTimeRef.current = performance.now();
        }

        const elapsed = performance.now() - startTimeRef.current;
        const t = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);

        // Interpolate position
        groupRef.current.position.lerpVectors(
            prevPosition.current,
            targetPosition.current,
            eased,
        );

        // Interpolate rotation
        groupRef.current.quaternion.slerpQuaternions(
            prevQuaternion.current,
            targetQuaternion.current,
            eased,
        );

        progressRef.current = t;
        if (t >= 1) {
            setIsAnimating(false);
        }
    });

    return { groupRef, isAnimating };
}

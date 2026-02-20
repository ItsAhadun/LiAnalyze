'use client';

/**
 * Auto-solver controller hook.
 *
 * Consumes the Gauss-Jordan generator and dispatches steps
 * at configurable intervals with play/pause/step controls.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AugmentedMatrix } from '@/lib/types/matrix';
import type { SolverStep, SolverConfig } from '@/lib/types/solver';
import { gaussJordanSolver } from '@/lib/math/solver';

interface UseSolverOptions {
    /** Milliseconds between steps during auto-play (default: 1200) */
    stepDelay?: number;
    /** Solver configuration */
    config?: Partial<SolverConfig>;
    /** Callback when a step is produced */
    onStep?: (step: SolverStep) => void;
    /** Callback when solving is complete */
    onComplete?: (steps: SolverStep[]) => void;
}

export function useSolver(options: UseSolverOptions = {}) {
    const { stepDelay = 1200, config = {}, onStep, onComplete } = options;

    const [isPlaying, setIsPlaying] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [allSteps, setAllSteps] = useState<SolverStep[]>([]);

    const generatorRef = useRef<Generator<SolverStep> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stepsRef = useRef<SolverStep[]>([]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    /**
     * Pre-compute all solver steps from the given matrix.
     * Returns the full step array without dispatching them.
     */
    const precomputeSteps = useCallback(
        (matrix: AugmentedMatrix): SolverStep[] => {
            const steps: SolverStep[] = [];
            for (const step of gaussJordanSolver(matrix, config)) {
                steps.push(step);
            }
            return steps;
        },
        [config],
    );

    /**
     * Start auto-solving from the given matrix.
     */
    const startAutoSolve = useCallback(
        (matrix: AugmentedMatrix) => {
            // Pre-compute all steps
            const steps = precomputeSteps(matrix);
            stepsRef.current = steps;
            setAllSteps(steps);
            setIsSolving(true);
            setIsPlaying(true);

            // Start dispatching steps one by one
            let currentIdx = 0;

            // Dispatch first step immediately
            if (steps.length > 0) {
                onStep?.(steps[0]);
                currentIdx = 1;
            }

            intervalRef.current = setInterval(() => {
                if (currentIdx >= steps.length) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setIsPlaying(false);
                    setIsSolving(false);
                    onComplete?.(steps);
                    return;
                }

                onStep?.(steps[currentIdx]);
                currentIdx++;
            }, stepDelay / speed);
        },
        [precomputeSteps, stepDelay, speed, onStep, onComplete],
    );

    /**
     * Pause auto-solve playback.
     */
    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
    }, []);

    /**
     * Stop auto-solve and reset.
     */
    const stop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
        setIsSolving(false);
        generatorRef.current = null;
        stepsRef.current = [];
    }, []);

    return {
        isPlaying,
        isSolving,
        speed,
        setSpeed,
        allSteps,
        precomputeSteps,
        startAutoSolve,
        pause,
        stop,
    };
}

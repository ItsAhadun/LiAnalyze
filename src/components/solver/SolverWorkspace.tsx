'use client';

/**
 * SolverWorkspace — Main solver page component.
 *
 * Orchestrates all solver components:
 * - Equation input (initial state)
 * - Split view: Matrix/Controls (left) + 3D Canvas (right)
 * - Explanation panel (bottom)
 * - Timeline controls
 */

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Undo2, RotateCcw } from 'lucide-react';
import EquationInput from '@/components/solver/EquationInput';
import AugmentedMatrixDisplay from '@/components/solver/AugmentedMatrix';
import RowOpToolbar from '@/components/solver/RowOpToolbar';
import ExplanationPanel from '@/components/solver/ExplanationPanel';
import TimelineSlider from '@/components/solver/TimelineSlider';
import { useHistory } from '@/hooks/useHistory';
import { useSolver } from '@/hooks/useSolver';
import { findIntersectionPoint } from '@/lib/math/plane-geometry';
import { classifySolution } from '@/lib/math/solver';
import type { AugmentedMatrix, RowOperation } from '@/lib/types/matrix';

// Dynamic import for R3F Canvas (no SSR)
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <div className="text-foreground/30 text-sm font-mono">Loading 3D Engine...</div>
        </div>
    ),
});

type Phase = 'input' | 'solving';

export default function SolverWorkspace() {
    const [phase, setPhase] = useState<Phase>('input');
    const [numVars, setNumVars] = useState(3);
    const [initialMatrix, setInitialMatrix] = useState<AugmentedMatrix>([
        [1, 2, 3, 14],
        [2, 5, 6, 30],
        [3, 1, 1, 10],
    ]);

    const history = useHistory(initialMatrix);
    const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

    const solver = useSolver({
        stepDelay: 1200,
        onStep: (step) => {
            if (step.operation) {
                history.applyRowOp(step.operation);
            }
        },
    });

    // Compute intersection point
    const intersectionPoint = useMemo(() => {
        if (numVars !== 3 || history.present.planes.length < 3) return null;
        return findIntersectionPoint(history.present.planes.slice(0, 3));
    }, [history.present.planes, numVars]);

    // Solution classification
    const solutionType = useMemo(
        () => classifySolution(history.present.matrix),
        [history.present.matrix],
    );

    const handleSubmit = useCallback(
        (matrix: AugmentedMatrix, vars: number) => {
            setInitialMatrix(matrix);
            setNumVars(vars);
            history.reset(matrix);
            setPhase('solving');
        },
        [history],
    );

    const handleApplyOp = useCallback(
        (op: RowOperation) => {
            // Highlight affected rows briefly
            const affectedRows =
                op.type === 'swap'
                    ? [op.row1, op.row2]
                    : op.type === 'scale'
                        ? [op.row]
                        : [op.targetRow];
            setHighlightedRow(affectedRows[0]);
            setTimeout(() => setHighlightedRow(null), 600);

            history.applyRowOp(op);
        },
        [history],
    );

    const handleAutoSolve = useCallback(() => {
        // Reset to initial state first, then auto-solve
        history.reset(initialMatrix);
        solver.startAutoSolve(initialMatrix);
    }, [history, initialMatrix, solver]);

    const handleBackToInput = useCallback(() => {
        solver.stop();
        setPhase('input');
    }, [solver]);

    // ─── Input Phase ───────────────────────────────────────────

    if (phase === 'input') {
        return (
            <div className="max-w-lg mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        System of Linear Equations
                    </h1>
                    <p className="text-sm text-foreground/50">
                        Enter your coefficients and constants to visualize
                    </p>
                </div>

                <div className="bg-white/[0.02] rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                    <EquationInput onSubmit={handleSubmit} />
                </div>
            </div>
        );
    }

    // ─── Solving Phase ─────────────────────────────────────────

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col">
            {/* Main split view */}
            <div className="flex-1 flex min-h-0">
                {/* Left panel: Matrix + Controls */}
                <div className="w-[400px] min-w-[350px] flex flex-col border-r border-white/10 bg-background/50 overflow-y-auto">
                    <div className="p-4 space-y-5">
                        {/* Top Controls: Back & Undo/Redo */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBackToInput}
                                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
                            >
                                <RotateCcw size={12} />
                                Back to Input
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={history.undo}
                                    disabled={!history.canUndo || solver.isPlaying}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-xs font-semibold transition-colors text-foreground/80"
                                >
                                    <Undo2 size={14} />
                                    Undo
                                </button>
                                <button
                                    onClick={history.redo}
                                    disabled={!history.canRedo || solver.isPlaying}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-xs font-semibold transition-colors text-foreground/80"
                                >
                                    <Undo2 size={14} className="scale-x-[-1]" />
                                    Redo
                                </button>
                            </div>
                        </div>

                        {/* Matrix display */}
                        <div>
                            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                                Augmented Matrix
                            </h3>
                            <div className="flex justify-center">
                                <AugmentedMatrixDisplay
                                    matrix={history.present.matrix}
                                    highlightedRows={highlightedRow !== null ? [highlightedRow] : []}
                                    numVars={numVars}
                                />
                            </div>
                        </div>

                        {/* Solution status badge */}
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${solutionType === 'unique'
                                    ? 'bg-green-500'
                                    : solutionType === 'infinite'
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                    }`}
                            />
                            <span className="text-xs font-medium text-foreground/60">
                                {solutionType === 'unique' && intersectionPoint
                                    ? `Unique: (${intersectionPoint.map((v) => v.toFixed(2)).join(', ')})`
                                    : solutionType === 'infinite'
                                        ? 'Infinite Solutions'
                                        : solutionType === 'none'
                                            ? 'No Solution'
                                            : 'Computing...'}
                            </span>
                        </div>

                        {/* Row operations */}
                        <RowOpToolbar
                            numRows={history.present.matrix.length}
                            onApply={handleApplyOp}
                            disabled={solver.isPlaying}
                        />

                        {/* Explanation */}
                        <ExplanationPanel
                            snapshots={history.allSnapshots}
                            currentStep={history.currentStep}
                            totalSteps={history.totalSteps}
                        />
                    </div>
                </div>

                {/* Right panel: 3D Canvas */}
                <div className="flex-1 p-3">
                    <Scene
                        planes={history.present.planes}
                        intersectionPoint={intersectionPoint}
                        highlightedRow={highlightedRow}
                    />
                </div>
            </div>

            {/* Bottom: Timeline */}
            <div className="border-t border-white/10 px-4 py-3 bg-background/80 backdrop-blur-sm">
                <TimelineSlider
                    currentStep={history.currentStep}
                    totalSteps={history.totalSteps}
                    canUndo={history.canUndo}
                    canRedo={history.canRedo}
                    isPlaying={solver.isPlaying}
                    onUndo={history.undo}
                    onRedo={history.redo}
                    onJumpTo={history.jumpTo}
                    onAutoSolve={handleAutoSolve}
                    onPause={solver.pause}
                    speed={solver.speed}
                    onSpeedChange={solver.setSpeed}
                />
            </div>
        </div>
    );
}

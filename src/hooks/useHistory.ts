'use client';

/**
 * Undo/Redo history hook for managing solver state.
 *
 * Implements a stack-based undo/redo pattern using useReducer.
 * Supports: APPLY_ROW_OP, UNDO, REDO, JUMP_TO, RESET actions.
 *
 * Memory is negligible: a 6×4 matrix snapshot is ~200 bytes,
 * so 1000 steps = ~200KB.
 */

import { useReducer, useCallback, useMemo } from 'react';
import type { Snapshot, RowOperation, AugmentedMatrix } from '@/lib/types/matrix';
import {
    cloneMatrix,
    swapRows,
    scaleRow,
    addMultipleOfRow,
    cleanMatrix,
} from '@/lib/math/matrix-utils';
import { generateExplanation, generateLatex } from '@/lib/math/explanation';
import { matrixToPlanes } from '@/lib/math/plane-geometry';

// ─── State ─────────────────────────────────────────────────────

interface HistoryState {
    past: Snapshot[];
    present: Snapshot;
    future: Snapshot[];
}

// ─── Actions ───────────────────────────────────────────────────

type HistoryAction =
    | { type: 'APPLY_ROW_OP'; payload: RowOperation }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'JUMP_TO'; payload: number }
    | { type: 'RESET'; payload: AugmentedMatrix };

// ─── Helpers ───────────────────────────────────────────────────

function applyOperation(matrix: AugmentedMatrix, op: RowOperation): AugmentedMatrix {
    switch (op.type) {
        case 'swap':
            return cleanMatrix(swapRows(matrix, op.row1, op.row2));
        case 'scale':
            return cleanMatrix(scaleRow(matrix, op.row, op.scalar));
        case 'add_multiple':
            return cleanMatrix(addMultipleOfRow(matrix, op.targetRow, op.sourceRow, op.scalar));
    }
}

function createSnapshot(matrix: AugmentedMatrix, op: RowOperation | null): Snapshot {
    return {
        matrix: cloneMatrix(matrix),
        operation: op,
        explanation: op ? generateExplanation(op) : 'Initial system',
        latex: op ? generateLatex(op) : '',
        planes: matrixToPlanes(matrix),
    };
}

function createInitialSnapshot(matrix: AugmentedMatrix): Snapshot {
    return createSnapshot(matrix, null);
}

// ─── Reducer ───────────────────────────────────────────────────

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
    switch (action.type) {
        case 'APPLY_ROW_OP': {
            const newMatrix = applyOperation(state.present.matrix, action.payload);
            const newSnapshot = createSnapshot(newMatrix, action.payload);
            return {
                past: [...state.past, state.present],
                present: newSnapshot,
                future: [], // Branch cut: clear redo stack
            };
        }

        case 'UNDO': {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            return {
                past: state.past.slice(0, -1),
                present: previous,
                future: [state.present, ...state.future],
            };
        }

        case 'REDO': {
            if (state.future.length === 0) return state;
            const next = state.future[0];
            return {
                past: [...state.past, state.present],
                present: next,
                future: state.future.slice(1),
            };
        }

        case 'JUMP_TO': {
            const allSnapshots = [...state.past, state.present, ...state.future];
            const index = action.payload;
            if (index < 0 || index >= allSnapshots.length) return state;
            return {
                past: allSnapshots.slice(0, index),
                present: allSnapshots[index],
                future: allSnapshots.slice(index + 1),
            };
        }

        case 'RESET': {
            const initial = createInitialSnapshot(action.payload);
            return {
                past: [],
                present: initial,
                future: [],
            };
        }

        default:
            return state;
    }
}

// ─── Hook ──────────────────────────────────────────────────────

export function useHistory(initialMatrix: AugmentedMatrix) {
    const [state, dispatch] = useReducer(historyReducer, {
        past: [],
        present: createInitialSnapshot(initialMatrix),
        future: [],
    });

    const applyRowOp = useCallback(
        (op: RowOperation) => dispatch({ type: 'APPLY_ROW_OP', payload: op }),
        [],
    );

    const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
    const jumpTo = useCallback(
        (index: number) => dispatch({ type: 'JUMP_TO', payload: index }),
        [],
    );
    const reset = useCallback(
        (matrix: AugmentedMatrix) => dispatch({ type: 'RESET', payload: matrix }),
        [],
    );

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;
    const currentStep = state.past.length;
    const totalSteps = state.past.length + 1 + state.future.length;

    const allSnapshots = useMemo(
        () => [...state.past, state.present, ...state.future],
        [state.past, state.present, state.future],
    );

    return {
        // Current state
        present: state.present,
        allSnapshots,

        // Actions
        applyRowOp,
        undo,
        redo,
        jumpTo,
        reset,

        // Status
        canUndo,
        canRedo,
        currentStep,
        totalSteps,
    };
}

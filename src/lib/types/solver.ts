/**
 * Solver-specific type definitions.
 *
 * The solver produces a sequence of SolverSteps, each representing
 * an intermediate state during Gauss-Jordan elimination.
 */

import type { AugmentedMatrix, RowOperation, PlaneParams } from './matrix';

/** Classification of the solution to a linear system. */
export type SolutionType = 'unique' | 'infinite' | 'none';

/** A single step in the solver's output sequence. */
export interface SolverStep {
    /** Step index (0 = initial state) */
    stepIndex: number;
    /** The augmented matrix after this step */
    matrix: AugmentedMatrix;
    /** The operation applied (null for initial/complete) */
    operation: RowOperation | null;
    /** Human-readable explanation */
    explanation: string;
    /** LaTeX string for the operation */
    latex: string;
    /** Whether this is the initial, intermediate, or final step */
    phase: 'initial' | 'intermediate' | 'complete';
}

/** The complete result of solving a system. */
export interface SolverResult {
    /** All steps from initial to final */
    steps: SolverStep[];
    /** The solution type */
    solutionType: SolutionType;
    /** Solution values (for unique solutions) or null */
    solution: number[] | null;
    /** Parametric description (for infinite solutions) or null */
    parametric: string | null;
    /** Final RREF matrix */
    rref: AugmentedMatrix;
}

/** Configuration for the solver. */
export interface SolverConfig {
    /** Use partial pivoting? (default: true) */
    partialPivoting: boolean;
    /** Perform full RREF or stop at REF? (default: 'rref') */
    mode: 'ref' | 'rref';
}

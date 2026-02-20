/**
 * Custom iterative Gauss-Jordan elimination solver.
 *
 * Implemented as a generator function that yields a SolverStep
 * after every elementary row operation, enabling:
 *   - Step-by-step visualization
 *   - Human-readable explanations at each step
 *   - Timeline scrubbing (play/pause/rewind)
 *
 * Supports:
 *   - Partial pivoting (selecting largest |value| in pivot column)
 *   - Both REF (Row Echelon Form) and RREF (Reduced Row Echelon Form)
 *   - Detection of unique, infinite, and no-solution cases
 */

import type { AugmentedMatrix, RowOperation } from '../types/matrix';
import type { SolverStep, SolverResult, SolverConfig, SolutionType } from '../types/solver';
import {
    cloneMatrix,
    swapRows,
    scaleRow,
    addMultipleOfRow,
    cleanMatrix,
    isZeroRow,
} from './matrix-utils';
import { generateExplanation, generateLatex } from './explanation';

const DEFAULT_CONFIG: SolverConfig = {
    partialPivoting: true,
    mode: 'rref',
};

/**
 * Generator function that performs iterative Gauss-Jordan elimination.
 *
 * Yields a SolverStep after each elementary row operation, allowing
 * the consumer to animate or display each intermediate state.
 *
 * Algorithm:
 * 1. For each column (pivot position):
 *    a. Find the best pivot row (partial pivoting if enabled)
 *    b. Swap pivot row into position if needed
 *    c. Scale pivot to 1
 *    d. Eliminate all other entries in the column
 *       - Forward only for REF mode
 *       - Both directions for RREF mode
 *
 * @param inputMatrix - The initial augmented matrix [A|b]
 * @param config - Solver configuration
 */
export function* gaussJordanSolver(
    inputMatrix: AugmentedMatrix,
    config: Partial<SolverConfig> = {},
): Generator<SolverStep> {
    const { partialPivoting, mode } = { ...DEFAULT_CONFIG, ...config };

    let matrix = cloneMatrix(inputMatrix);
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    let stepIndex = 0;

    // Yield initial state
    yield {
        stepIndex: stepIndex++,
        matrix: cloneMatrix(matrix),
        operation: null,
        explanation: 'Initial augmented matrix',
        latex: '',
        phase: 'initial',
    };

    let pivotRow = 0;

    // Forward elimination
    for (let col = 0; col < numCols - 1 && pivotRow < numRows; col++) {
        // --- Partial Pivoting ---
        if (partialPivoting) {
            let maxVal = Math.abs(matrix[pivotRow][col]);
            let maxRow = pivotRow;

            for (let row = pivotRow + 1; row < numRows; row++) {
                const absVal = Math.abs(matrix[row][col]);
                if (absVal > maxVal) {
                    maxVal = absVal;
                    maxRow = row;
                }
            }

            // If the best pivot is zero, skip this column
            if (maxVal < 1e-10) continue;

            // Swap if better pivot found
            if (maxRow !== pivotRow) {
                const op: RowOperation = {
                    type: 'swap',
                    row1: pivotRow,
                    row2: maxRow,
                };
                matrix = swapRows(matrix, pivotRow, maxRow);
                matrix = cleanMatrix(matrix);
                yield {
                    stepIndex: stepIndex++,
                    matrix: cloneMatrix(matrix),
                    operation: op,
                    explanation: generateExplanation(op),
                    latex: generateLatex(op),
                    phase: 'intermediate',
                };
            }
        } else {
            // Without partial pivoting, check if current pivot is zero
            if (Math.abs(matrix[pivotRow][col]) < 1e-10) continue;
        }

        // --- Scale pivot to 1 ---
        const pivotVal = matrix[pivotRow][col];
        if (Math.abs(pivotVal) > 1e-10 && Math.abs(pivotVal - 1) > 1e-10) {
            const scalar = 1 / pivotVal;
            const op: RowOperation = {
                type: 'scale',
                row: pivotRow,
                scalar,
            };
            matrix = scaleRow(matrix, pivotRow, scalar);
            matrix = cleanMatrix(matrix);
            yield {
                stepIndex: stepIndex++,
                matrix: cloneMatrix(matrix),
                operation: op,
                explanation: generateExplanation(op),
                latex: generateLatex(op),
                phase: 'intermediate',
            };
        }

        // --- Eliminate entries in this column ---
        const startRow = mode === 'rref' ? 0 : pivotRow + 1;
        for (let row = startRow; row < numRows; row++) {
            if (row === pivotRow) continue;
            const entry = matrix[row][col];
            if (Math.abs(entry) < 1e-10) continue;

            const scalar = -entry;
            const op: RowOperation = {
                type: 'add_multiple',
                targetRow: row,
                sourceRow: pivotRow,
                scalar,
            };
            matrix = addMultipleOfRow(matrix, row, pivotRow, scalar);
            matrix = cleanMatrix(matrix);
            yield {
                stepIndex: stepIndex++,
                matrix: cloneMatrix(matrix),
                operation: op,
                explanation: generateExplanation(op),
                latex: generateLatex(op),
                phase: 'intermediate',
            };
        }

        pivotRow++;
    }

    // Final step
    yield {
        stepIndex: stepIndex++,
        matrix: cloneMatrix(matrix),
        operation: null,
        explanation:
            mode === 'rref'
                ? 'Reduced Row Echelon Form (RREF) achieved'
                : 'Row Echelon Form (REF) achieved',
        latex: '',
        phase: 'complete',
    };
}

/**
 * Run the full solver and collect all steps into a SolverResult.
 *
 * This is the non-generator convenience wrapper.
 */
export function solveSystem(
    inputMatrix: AugmentedMatrix,
    config: Partial<SolverConfig> = {},
): SolverResult {
    const steps: SolverStep[] = [];
    for (const step of gaussJordanSolver(inputMatrix, config)) {
        steps.push(step);
    }

    const rref = steps[steps.length - 1].matrix;
    const solutionType = classifySolution(rref);
    const solution = solutionType === 'unique' ? extractSolution(rref) : null;
    const parametric =
        solutionType === 'infinite' ? 'Free variable(s) present in the system' : null;

    return {
        steps,
        solutionType,
        solution,
        parametric,
        rref,
    };
}

/**
 * Classify the solution of a system from its RREF.
 *
 * - Unique: Every column (except the last) has a pivot (leading 1).
 * - Infinite: Some non-constant columns lack a pivot (free variables), but no inconsistency.
 * - None: A row of the form [0 0 ... 0 | c] where c ≠ 0 (inconsistent).
 */
export function classifySolution(rref: AugmentedMatrix): SolutionType {
    const numRows = rref.length;
    const numCols = rref[0].length;
    const numVars = numCols - 1;

    // Check for inconsistent rows: [0, 0, ..., 0 | c] where c ≠ 0
    for (let i = 0; i < numRows; i++) {
        const coeffsZero = rref[i].slice(0, numVars).every((v) => Math.abs(v) < 1e-10);
        const constNonZero = Math.abs(rref[i][numVars]) > 1e-10;
        if (coeffsZero && constNonZero) {
            return 'none';
        }
    }

    // Count pivots (leading 1s)
    let pivotCount = 0;
    for (let i = 0; i < numRows; i++) {
        if (!isZeroRow(rref[i])) {
            pivotCount++;
        }
    }

    return pivotCount >= numVars ? 'unique' : 'infinite';
}

/**
 * Extract the solution vector from a RREF with a unique solution.
 *
 * Assumes the matrix is in proper RREF with pivots in every variable column.
 */
function extractSolution(rref: AugmentedMatrix): number[] {
    const numCols = rref[0].length;
    const numVars = numCols - 1;
    const solution: number[] = [];

    for (let i = 0; i < numVars && i < rref.length; i++) {
        solution.push(rref[i][numCols - 1]);
    }

    return solution;
}

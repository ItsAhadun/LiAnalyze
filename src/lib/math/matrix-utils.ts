/**
 * Matrix utility functions for elementary row operations.
 *
 * All functions operate on number[][] (augmented matrices)
 * and return new arrays (immutable by convention).
 *
 * Row indices are 0-based throughout.
 */

import type { AugmentedMatrix } from '../types/matrix';

/**
 * Deep-clone an augmented matrix.
 * \( M' = \text{copy}(M) \) such that mutations to M' do not affect M.
 */
export function cloneMatrix(matrix: AugmentedMatrix): AugmentedMatrix {
    return matrix.map((row) => [...row]);
}

/**
 * Swap two rows in the matrix.
 * \( R_i \leftrightarrow R_j \)
 *
 * @returns A new matrix with rows i and j swapped.
 */
export function swapRows(
    matrix: AugmentedMatrix,
    i: number,
    j: number,
): AugmentedMatrix {
    if (i === j) return cloneMatrix(matrix);
    const result = cloneMatrix(matrix);
    [result[i], result[j]] = [result[j], result[i]];
    return result;
}

/**
 * Scale a row by a non-zero scalar.
 * \( R_i \leftarrow k \cdot R_i \)
 *
 * @param k - Non-zero scalar
 * @returns A new matrix with row i scaled.
 * @throws If k is zero.
 */
export function scaleRow(
    matrix: AugmentedMatrix,
    i: number,
    k: number,
): AugmentedMatrix {
    if (k === 0) throw new Error('Scalar cannot be zero for row scaling');
    const result = cloneMatrix(matrix);
    result[i] = result[i].map((val) => val * k);
    return result;
}

/**
 * Add a scalar multiple of one row to another.
 * \( R_{\text{target}} \leftarrow R_{\text{target}} + k \cdot R_{\text{source}} \)
 *
 * @param targetRow - The row being modified
 * @param sourceRow - The row being multiplied and added
 * @param k - The scalar multiplier
 * @returns A new matrix with the operation applied.
 */
export function addMultipleOfRow(
    matrix: AugmentedMatrix,
    targetRow: number,
    sourceRow: number,
    k: number,
): AugmentedMatrix {
    const result = cloneMatrix(matrix);
    result[targetRow] = result[targetRow].map(
        (val, col) => val + k * result[sourceRow][col],
    );
    return result;
}

/**
 * Check if a row is a zero row (all entries are 0, or effectively 0).
 */
export function isZeroRow(row: number[], tolerance = 1e-10): boolean {
    return row.every((val) => Math.abs(val) < tolerance);
}

/**
 * Validate an augmented matrix.
 * - Must have at least 1 row
 * - All rows must have the same number of columns
 * - Must have at least 2 columns (1 variable + 1 constant)
 *
 * @returns An error message or null if valid.
 */
export function validateMatrix(matrix: AugmentedMatrix): string | null {
    if (!matrix || matrix.length === 0) {
        return 'Matrix must have at least one row';
    }
    const cols = matrix[0].length;
    if (cols < 2) {
        return 'Matrix must have at least 2 columns (1 variable + 1 constant)';
    }
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i].length !== cols) {
            return `Row ${i + 1} has ${matrix[i].length} columns but expected ${cols}`;
        }
        for (let j = 0; j < cols; j++) {
            if (typeof matrix[i][j] !== 'number' || isNaN(matrix[i][j])) {
                return `Invalid value at row ${i + 1}, column ${j + 1}`;
            }
        }
    }
    return null;
}

/**
 * Count the number of variables in a system.
 * For an augmented matrix with C columns, there are C-1 variables.
 */
export function getNumVariables(matrix: AugmentedMatrix): number {
    return matrix[0].length - 1;
}

/**
 * Round very small floating-point values to zero to clean up results.
 */
export function cleanMatrix(
    matrix: AugmentedMatrix,
    tolerance = 1e-10,
): AugmentedMatrix {
    return matrix.map((row) =>
        row.map((val) => (Math.abs(val) < tolerance ? 0 : val)),
    );
}

/**
 * Format a number for display.
 * Shows fractions when possible, otherwise rounds to reasonable precision.
 */
export function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    // Check common fractions
    const fractions: [number, string][] = [
        [1 / 2, '1/2'], [-1 / 2, '-1/2'],
        [1 / 3, '1/3'], [-1 / 3, '-1/3'],
        [2 / 3, '2/3'], [-2 / 3, '-2/3'],
        [1 / 4, '1/4'], [-1 / 4, '-1/4'],
        [3 / 4, '3/4'], [-3 / 4, '-3/4'],
        [1 / 5, '1/5'], [-1 / 5, '-1/5'],
        [1 / 6, '1/6'], [-1 / 6, '-1/6'],
        [5 / 6, '5/6'], [-5 / 6, '-5/6'],
    ];
    for (const [val, str] of fractions) {
        if (Math.abs(n - val) < 1e-10) return str;
    }
    return Number(n.toFixed(4)).toString();
}

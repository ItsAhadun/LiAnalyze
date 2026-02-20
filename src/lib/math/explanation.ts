/**
 * Step explanation template engine.
 *
 * Generates human-readable and LaTeX descriptions for each elementary row operation.
 * Uses 1-based row notation in output (e.g., R₁, R₂) while accepting 0-based indices.
 */

import type { RowOperation } from '../types/matrix';
import { formatNumber } from './matrix-utils';

/**
 * Generate a human-readable explanation for a row operation.
 */
export function generateExplanation(op: RowOperation): string {
    switch (op.type) {
        case 'swap':
            return `Swap Row ${op.row1 + 1} and Row ${op.row2 + 1}`;
        case 'scale': {
            const scalar = formatNumber(op.scalar);
            return `Multiply Row ${op.row + 1} by ${scalar}`;
        }
        case 'add_multiple': {
            const scalar = formatNumber(op.scalar);
            if (op.scalar > 0) {
                return `Add ${scalar} × Row ${op.sourceRow + 1} to Row ${op.targetRow + 1}`;
            } else {
                return `Subtract ${formatNumber(Math.abs(op.scalar))} × Row ${op.sourceRow + 1} from Row ${op.targetRow + 1}`;
            }
        }
    }
}

/**
 * Generate a LaTeX string for a row operation.
 *
 * Uses standard notation:
 * - Swap: R_i \leftrightarrow R_j
 * - Scale: R_i \leftarrow k \cdot R_i
 * - Add-multiple: R_i \leftarrow R_i + k \cdot R_j
 */
export function generateLatex(op: RowOperation): string {
    switch (op.type) {
        case 'swap':
            return `R_{${op.row1 + 1}} \\leftrightarrow R_{${op.row2 + 1}}`;
        case 'scale': {
            const scalar = formatLatexNumber(op.scalar);
            return `R_{${op.row + 1}} \\leftarrow ${scalar} \\cdot R_{${op.row + 1}}`;
        }
        case 'add_multiple': {
            const scalar = formatLatexScalar(op.scalar);
            return `R_{${op.targetRow + 1}} \\leftarrow R_{${op.targetRow + 1}} ${scalar} \\cdot R_{${op.sourceRow + 1}}`;
        }
    }
}

/**
 * Format a number for LaTeX display.
 */
function formatLatexNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    // Check for simple fractions
    const num = closestFraction(n);
    if (num) return `\\frac{${num[0]}}{${num[1]}}`;
    return Number(n.toFixed(4)).toString();
}

/**
 * Format a scalar for the add-multiple operation in LaTeX.
 * Returns "+ k" or "- k" with proper sign handling.
 */
function formatLatexScalar(k: number): string {
    if (k > 0) {
        return `+ ${formatLatexNumber(k)}`;
    } else {
        return `- ${formatLatexNumber(Math.abs(k))}`;
    }
}

/**
 * Try to find a close fraction representation [numerator, denominator].
 */
function closestFraction(n: number): [number, number] | null {
    const tolerance = 1e-10;
    for (let d = 1; d <= 12; d++) {
        const num = Math.round(n * d);
        if (Math.abs(num / d - n) < tolerance && d !== 1) {
            // Simplify
            const g = gcd(Math.abs(num), d);
            return [num / g, d / g];
        }
    }
    return null;
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Generate a human-readable equation string from a matrix row.
 *
 * For a 3-variable system with row [a, b, c, d]:
 *   → "ax + by + cz = d"
 *
 * @param row - Matrix row including the constant (last element)
 * @param variables - Variable names (default: ['x', 'y', 'z'])
 */
export function rowToEquationString(
    row: number[],
    variables = ['x', 'y', 'z'],
): string {
    const numVars = row.length - 1;
    const constant = row[numVars];
    const terms: string[] = [];

    for (let i = 0; i < numVars && i < variables.length; i++) {
        const coeff = row[i];
        if (Math.abs(coeff) < 1e-10) continue;

        let term: string;
        if (Math.abs(coeff) === 1) {
            term = coeff > 0 ? variables[i] : `-${variables[i]}`;
        } else {
            term = `${formatNumber(coeff)}${variables[i]}`;
        }

        if (terms.length > 0 && coeff > 0) {
            term = `+ ${term}`;
        }
        terms.push(term);
    }

    if (terms.length === 0) {
        return `0 = ${formatNumber(constant)}`;
    }

    return `${terms.join(' ')} = ${formatNumber(constant)}`;
}

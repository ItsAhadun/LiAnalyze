/**
 * Core type definitions for the Linalyze matrix system.
 *
 * An augmented matrix [A|b] represents the system Ax = b,
 * where A is the coefficient matrix and b is the constants vector.
 */

/** A 2D array of numbers representing an augmented matrix [A|b]. */
export type AugmentedMatrix = number[][];

/** Parameters describing a 3D plane derived from a matrix row [a, b, c | d] → ax + by + cz = d */
export interface PlaneParams {
  /** Normal vector (a, b, c) */
  normal: [number, number, number];
  /** Constant d in ax + by + cz = d */
  constant: number;
  /** Color for this plane (hex string) */
  color: string;
  /** Human-readable equation string */
  equation: string;
}

/** Parameters describing a 2D line derived from a matrix row [a, b | c] → ax + by = c */
export interface LineParams {
  /** Coefficients (a, b) */
  coefficients: [number, number];
  /** Constant c in ax + by = c */
  constant: number;
  /** Color for this line (hex string) */
  color: string;
  /** Human-readable equation string */
  equation: string;
}

// ─── Row Operations ────────────────────────────────────────────

export interface SwapOperation {
  type: 'swap';
  /** First row index (0-based) */
  row1: number;
  /** Second row index (0-based) */
  row2: number;
}

export interface ScaleOperation {
  type: 'scale';
  /** Row index to scale (0-based) */
  row: number;
  /** Non-zero scalar multiplier */
  scalar: number;
}

export interface AddMultipleOperation {
  type: 'add_multiple';
  /** Target row index: the row being modified */
  targetRow: number;
  /** Source row index: the row being multiplied and added */
  sourceRow: number;
  /** Scalar multiplier for the source row */
  scalar: number;
}

export type RowOperation = SwapOperation | ScaleOperation | AddMultipleOperation;

// ─── Snapshots ─────────────────────────────────────────────────

/** A frozen snapshot of the solver state at a given step. */
export interface Snapshot {
  /** The augmented matrix at this step */
  matrix: AugmentedMatrix;
  /** The operation that produced this snapshot (null for initial state) */
  operation: RowOperation | null;
  /** Human-readable explanation of what happened */
  explanation: string;
  /** LaTeX string for the operation */
  latex: string;
  /** Plane parameters derived from each row */
  planes: PlaneParams[];
}

// ─── Colors ────────────────────────────────────────────────────

/** Default color palette for planes (up to 6 equations) */
export const PLANE_COLORS = [
  '#6366f1', // Indigo
  '#22c55e', // Green
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
] as const;

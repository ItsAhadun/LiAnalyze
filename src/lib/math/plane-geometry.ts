/**
 * Plane geometry conversion utilities.
 *
 * Converts augmented matrix rows to 3D plane parameters for React-Three-Fiber.
 *
 * Given a row [a, b, c | d] representing \( ax + by + cz = d \):
 * - Normal vector: \( \vec{n} = (a, b, c) \)
 * - The plane passes through a point P such that \( \vec{n} \cdot P = d \)
 * - For Three.js: we compute position and quaternion from the normal.
 */

import type { PlaneParams, PLANE_COLORS } from '../types/matrix';
import { rowToEquationString } from './explanation';

/**
 * Convert a matrix row [a, b, c, d] to PlaneParams for 3D rendering.
 *
 * The plane equation is \( ax + by + cz = d \).
 * The normal vector is \( \vec{n} = (a, b, c) \).
 * A point on the plane is computed as \( P = \frac{d}{\|\vec{n}\|^2} \vec{n} \).
 *
 * @param row - Array of 4 numbers [a, b, c, d]
 * @param color - Hex color string for this plane
 * @param index - Row index for color fallback
 */
export function rowToPlaneParams(
    row: number[],
    color: string,
): PlaneParams {
    const a = row[0];
    const b = row[1];
    const c = row[2];
    const d = row[row.length - 1];

    return {
        normal: [a, b, c],
        constant: d,
        color,
        equation: rowToEquationString(row),
    };
}

/**
 * Convert all rows of an augmented matrix to PlaneParams.
 *
 * @param matrix - The augmented matrix
 * @param colors - Color palette (defaults to PLANE_COLORS)
 */
export function matrixToPlanes(
    matrix: number[][],
    colors: readonly string[] = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'],
): PlaneParams[] {
    return matrix.map((row, i) =>
        rowToPlaneParams(row, colors[i % colors.length]),
    );
}

/**
 * Compute the position offset for a plane in 3D space.
 *
 * For the plane \( ax + by + cz = d \), the closest point to the origin
 * on the plane is: \( P = \frac{d}{\|\vec{n}\|^2} \cdot \vec{n} \)
 *
 * @returns [x, y, z] position of the plane center
 */
export function computePlanePosition(
    normal: [number, number, number],
    constant: number,
): [number, number, number] {
    const [a, b, c] = normal;
    const normSq = a * a + b * b + c * c;

    if (normSq < 1e-10) {
        return [0, 0, 0]; // Degenerate plane
    }

    const scale = constant / normSq;
    return [a * scale, b * scale, c * scale];
}

/**
 * Compute the Euler rotation to orient a plane from the default XY orientation
 * to match the given normal vector.
 *
 * The default Three.js PlaneGeometry lies in the XY plane with normal (0, 0, 1).
 * We need to rotate it so its normal aligns with (a, b, c).
 *
 * @returns [rx, ry, rz] Euler angles in radians
 */
export function computePlaneRotation(
    normal: [number, number, number],
): [number, number, number] {
    const [a, b, c] = normal;
    const len = Math.sqrt(a * a + b * b + c * c);

    if (len < 1e-10) return [0, 0, 0];

    // Normalize
    const nx = a / len;
    const ny = b / len;
    const nz = c / len;

    // Compute rotation from (0, 0, 1) to (nx, ny, nz)
    // Using spherical coordinates
    const phi = Math.acos(Math.max(-1, Math.min(1, nz))); // angle from z-axis
    const theta = Math.atan2(ny, nx); // angle around z-axis

    // Convert to Euler angles for Three.js (XYZ order)
    // Rotate around Y by phi, then around Z by theta
    return [phi, 0, theta];
}

/**
 * Find the intersection point of three planes (unique solution).
 *
 * Given three planes:
 *   a₁x + b₁y + c₁z = d₁
 *   a₂x + b₂y + c₂z = d₂
 *   a₃x + b₃y + c₃z = d₃
 *
 * Uses Cramer's rule to find the unique solution if det ≠ 0.
 *
 * @returns [x, y, z] or null if no unique solution
 */
export function findIntersectionPoint(
    planes: PlaneParams[],
): [number, number, number] | null {
    if (planes.length < 3) return null;

    const [[a1, b1, c1], [a2, b2, c2], [a3, b3, c3]] = planes.map(
        (p) => p.normal,
    );
    const [d1, d2, d3] = planes.map((p) => p.constant);

    const det =
        a1 * (b2 * c3 - b3 * c2) -
        b1 * (a2 * c3 - a3 * c2) +
        c1 * (a2 * b3 - a3 * b2);

    if (Math.abs(det) < 1e-10) return null; // No unique solution

    const x =
        (d1 * (b2 * c3 - b3 * c2) -
            b1 * (d2 * c3 - d3 * c2) +
            c1 * (d2 * b3 - d3 * b2)) /
        det;

    const y =
        (a1 * (d2 * c3 - d3 * c2) -
            d1 * (a2 * c3 - a3 * c2) +
            c1 * (a2 * d3 - a3 * d2)) /
        det;

    const z =
        (a1 * (b2 * d3 - b3 * d2) -
            b1 * (a2 * d3 - a3 * d2) +
            d1 * (a2 * b3 - a3 * b2)) /
        det;

    return [x, y, z];
}

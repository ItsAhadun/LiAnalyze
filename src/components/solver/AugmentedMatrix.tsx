'use client';

/**
 * AugmentedMatrix — Visual matrix display with row highlighting.
 *
 * Color-codes rows to match their corresponding plane colors.
 * Highlights modified rows on operation with a pulse animation.
 */

import { useMemo } from 'react';
import { PLANE_COLORS } from '@/lib/types/matrix';
import { formatNumber } from '@/lib/math/matrix-utils';
import type { AugmentedMatrix as AugMatrixType } from '@/lib/types/matrix';

interface AugmentedMatrixProps {
    matrix: AugMatrixType;
    highlightedRows?: number[];
    numVars?: number;
}

export default function AugmentedMatrix({
    matrix,
    highlightedRows = [],
    numVars,
}: AugmentedMatrixProps) {
    const vars = numVars ?? matrix[0].length - 1;

    return (
        <div className="relative inline-block">
            {/* Matrix brackets */}
            <div className="flex items-stretch">
                {/* Left bracket */}
                <div className="w-1.5 border-l-2 border-t-2 border-b-2 border-foreground/30 rounded-l-sm" />

                {/* Matrix content */}
                <div className="px-2 py-1.5">
                    <table className="border-collapse">
                        <tbody>
                            {matrix.map((row, rowIdx) => {
                                const isHighlighted = highlightedRows.includes(rowIdx);
                                const rowColor = PLANE_COLORS[rowIdx % PLANE_COLORS.length];

                                return (
                                    <tr
                                        key={rowIdx}
                                        className={`transition-all duration-300 ${isHighlighted
                                                ? 'bg-amber-500/20 scale-[1.01]'
                                                : ''
                                            }`}
                                    >
                                        {row.map((val, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={`px-2.5 py-1 text-center font-mono text-sm transition-colors ${colIdx === vars
                                                        ? 'border-l-2 border-foreground/20 pl-3'
                                                        : ''
                                                    }`}
                                                style={{
                                                    color: colIdx < vars ? rowColor : undefined,
                                                }}
                                            >
                                                <span
                                                    className={`inline-block min-w-[2rem] ${isHighlighted ? 'font-bold' : 'font-medium'
                                                        }`}
                                                >
                                                    {formatNumber(val)}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Right bracket */}
                <div className="w-1.5 border-r-2 border-t-2 border-b-2 border-foreground/30 rounded-r-sm" />
            </div>
        </div>
    );
}

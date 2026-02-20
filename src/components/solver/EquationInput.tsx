'use client';

/**
 * EquationInput — Form to input a system of linear equations.
 *
 * Supports 2D (2 vars) and 3D (3 vars) with up to 6 equations.
 * Real-time coefficient validation with inline error display.
 * Mobile-responsive: inputs wrap on narrow screens.
 */

import { useState, useCallback } from 'react';
import { Plus, Minus, Play, RotateCcw } from 'lucide-react';
import type { AugmentedMatrix } from '@/lib/types/matrix';

interface EquationInputProps {
    onSubmit: (matrix: AugmentedMatrix, numVars: number) => void;
}

const VARIABLE_LABELS = ['x', 'y', 'z', 'w'];

// Default 3×3 example system: x + 2y + 3z = 14, 2x + 5y + 6z = 30, 3x + y + z = 10
const DEFAULT_SYSTEM = [
    [1, 2, 3, 14],
    [2, 5, 6, 30],
    [3, 1, 1, 10],
];

export default function EquationInput({ onSubmit }: EquationInputProps) {
    const [numVars, setNumVars] = useState(3);
    const [rows, setRows] = useState<number[][]>(DEFAULT_SYSTEM);
    const [error, setError] = useState<string | null>(null);

    const addRow = useCallback(() => {
        if (rows.length >= 6) return;
        setRows((prev) => [...prev, new Array(numVars + 1).fill(0)]);
    }, [rows.length, numVars]);

    const removeRow = useCallback(() => {
        if (rows.length <= 1) return;
        setRows((prev) => prev.slice(0, -1));
    }, [rows.length]);

    const updateCell = useCallback((row: number, col: number, value: string) => {
        const parsed = value === '' || value === '-' ? 0 : parseFloat(value);
        setRows((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = isNaN(parsed) ? 0 : parsed;
            return next;
        });
        setError(null);
    }, []);

    const switchDimension = useCallback((newVars: number) => {
        setNumVars(newVars);
        setRows((prev) =>
            prev.map((row) => {
                const newRow = new Array(newVars + 1).fill(0);
                for (let i = 0; i < Math.min(row.length - 1, newVars); i++) {
                    newRow[i] = row[i];
                }
                newRow[newVars] = row[row.length - 1]; // Keep constant
                return newRow;
            }),
        );
    }, []);

    const handleSubmit = useCallback(() => {
        // Validate
        for (let i = 0; i < rows.length; i++) {
            const allZeroCoeffs = rows[i].slice(0, numVars).every((v) => v === 0);
            if (allZeroCoeffs) {
                setError(`Row ${i + 1}: All coefficients are zero`);
                return;
            }
        }
        setError(null);
        onSubmit(rows, numVars);
    }, [rows, numVars, onSubmit]);

    const loadExample = useCallback(() => {
        if (numVars === 2) {
            setRows([
                [2, 1, 5],
                [1, 3, 10],
            ]);
        } else {
            setRows([...DEFAULT_SYSTEM]);
        }
        setError(null);
    }, [numVars]);

    return (
        <div className="space-y-4">
            {/* Dimension selector */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground/70">Dimensions:</span>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                    {[2, 3].map((d) => (
                        <button
                            key={d}
                            onClick={() => switchDimension(d)}
                            className={`px-4 py-1.5 text-sm font-semibold transition-colors ${numVars === d
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                                }`}
                        >
                            {d}D
                        </button>
                    ))}
                </div>
                <button
                    onClick={loadExample}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                >
                    <RotateCcw size={12} />
                    Load Example
                </button>
            </div>

            {/* Equation matrix input */}
            <div className="space-y-2">
                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex flex-wrap items-center gap-1.5 group">
                        <span className="text-xs text-foreground/40 w-5 font-mono shrink-0">
                            {rowIdx + 1}.
                        </span>
                        {row.slice(0, numVars).map((val, colIdx) => (
                            <div key={colIdx} className="flex items-center gap-1">
                                {colIdx > 0 && (
                                    <span className="text-foreground/40 text-sm">+</span>
                                )}
                                <input
                                    type="number"
                                    value={val || ''}
                                    onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                                    className="w-12 sm:w-14 h-9 rounded-md bg-white/5 border border-white/10 text-center text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0"
                                />
                                <span className="text-sm font-medium text-foreground/60 italic">
                                    {VARIABLE_LABELS[colIdx]}
                                </span>
                            </div>
                        ))}
                        <span className="text-foreground/50 font-bold mx-1">=</span>
                        <input
                            type="number"
                            value={row[numVars] || ''}
                            onChange={(e) => updateCell(rowIdx, numVars, e.target.value)}
                            className="w-14 sm:w-16 h-9 rounded-md bg-white/5 border border-white/10 text-center text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>

            {/* Add/Remove row buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={addRow}
                    disabled={rows.length >= 6}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={12} />
                    Add Equation
                </button>
                <button
                    onClick={removeRow}
                    disabled={rows.length <= 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Minus size={12} />
                    Remove
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
            >
                <Play size={16} />
                Visualize System
            </button>
        </div>
    );
}

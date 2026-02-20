'use client';

/**
 * RowOpToolbar — Row operation controls.
 *
 * Provides UI for the three elementary row operations:
 * - Swap: R_i ↔ R_j
 * - Scale: k·R_i → R_i
 * - Add Multiple: R_i + k·R_j → R_i
 */

import { useState, useCallback } from 'react';
import { ArrowUpDown, X as XIcon, Plus } from 'lucide-react';
import type { RowOperation } from '@/lib/types/matrix';

interface RowOpToolbarProps {
    numRows: number;
    onApply: (op: RowOperation) => void;
    disabled?: boolean;
}

type OpType = 'swap' | 'scale' | 'add_multiple';

function parseFraction(val: string): number {
    const trimmed = val.trim();
    if (!trimmed) return 0;
    if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                return num / den;
            }
        }
        return 0;
    }
    return parseFloat(trimmed) || 0;
}

export default function RowOpToolbar({
    numRows,
    onApply,
    disabled = false,
}: RowOpToolbarProps) {
    const [activeOp, setActiveOp] = useState<OpType>('swap');
    const [row1, setRow1] = useState(0);
    const [row2, setRow2] = useState(1);
    const [scalar, setScalar] = useState('1');

    const rowOptions = Array.from({ length: numRows }, (_, i) => i);

    const handleApply = useCallback(() => {
        const scalarNum = parseFraction(scalar);

        switch (activeOp) {
            case 'swap':
                if (row1 === row2) return;
                onApply({ type: 'swap', row1, row2 });
                break;
            case 'scale':
                if (scalarNum === 0) return;
                onApply({ type: 'scale', row: row1, scalar: scalarNum });
                break;
            case 'add_multiple':
                if (row1 === row2 || scalarNum === 0) return;
                onApply({
                    type: 'add_multiple',
                    targetRow: row1,
                    sourceRow: row2,
                    scalar: scalarNum,
                });
                break;
        }
    }, [activeOp, row1, row2, scalar, onApply]);

    const isValid = (() => {
        const scalarNum = parseFraction(scalar);
        switch (activeOp) {
            case 'swap':
                return row1 !== row2;
            case 'scale':
                return scalarNum !== 0;
            case 'add_multiple':
                return row1 !== row2 && scalarNum !== 0;
        }
    })();

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                Row Operations
            </h3>

            {/* Operation type selector */}
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                {([
                    { key: 'swap', label: 'Swap', icon: ArrowUpDown },
                    { key: 'scale', label: 'Scale', icon: XIcon },
                    { key: 'add_multiple', label: 'Add', icon: Plus },
                ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveOp(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-semibold transition-colors ${activeOp === key
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-foreground/50 hover:text-foreground/80 hover:bg-white/5'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Operation parameters */}
            <div className="space-y-2 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                {activeOp === 'swap' && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/50">R</span>
                        <select
                            value={row1}
                            onChange={(e) => setRow1(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-foreground"
                        >
                            {rowOptions.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900 text-white">
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                        <ArrowUpDown size={14} className="text-foreground/40" />
                        <span className="text-foreground/50">R</span>
                        <select
                            value={row2}
                            onChange={(e) => setRow2(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-foreground"
                        >
                            {rowOptions.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900 text-white">
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {activeOp === 'scale' && (
                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="text"
                            value={scalar}
                            onChange={(e) => setScalar(e.target.value)}
                            className="w-16 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-foreground text-center"
                            placeholder="k"
                        />
                        <span className="text-foreground/40">×</span>
                        <span className="text-foreground/50">R</span>
                        <select
                            value={row1}
                            onChange={(e) => setRow1(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-foreground"
                        >
                            {rowOptions.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900 text-white">
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                        <span className="text-foreground/40">→</span>
                        <span className="text-foreground/50">R</span>
                        <span className="font-mono text-xs text-foreground">
                            {row1 + 1}
                        </span>
                    </div>
                )}

                {activeOp === 'add_multiple' && (
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-foreground/50">R</span>
                        <select
                            value={row1}
                            onChange={(e) => setRow1(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono text-foreground"
                        >
                            {rowOptions.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900 text-white">
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                        <span className="text-foreground/40">+</span>
                        <input
                            type="text"
                            value={scalar}
                            onChange={(e) => setScalar(e.target.value)}
                            className="w-14 sm:w-16 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono text-foreground text-center"
                            placeholder="k"
                        />
                        <span className="text-foreground/40">×</span>
                        <span className="text-foreground/50">R</span>
                        <select
                            value={row2}
                            onChange={(e) => setRow2(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono text-foreground"
                        >
                            {rowOptions.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900 text-white">
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Apply button */}
            <button
                onClick={handleApply}
                disabled={disabled || !isValid}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-gray-600/30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
                Apply Operation
            </button>
        </div>
    );
}

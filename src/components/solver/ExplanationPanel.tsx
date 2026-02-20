'use client';

/**
 * ExplanationPanel — Step-by-step text with LaTeX rendering.
 *
 * Each step shows:
 * 1. Step counter
 * 2. LaTeX operation notation (rendered)
 * 3. Plain-English description
 */

import { useState } from 'react';
import type { Snapshot } from '@/lib/types/matrix';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExplanationPanelProps {
    snapshots: Snapshot[];
    currentStep: number;
    totalSteps: number;
}

export default function ExplanationPanel({
    snapshots,
    currentStep,
    totalSteps,
}: ExplanationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const snapshot = snapshots[currentStep];
    const hasOperation = snapshot.operation !== null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                    Step Explanation
                </h3>
                <span className="text-xs font-mono text-foreground/40">
                    Step {currentStep + 1} of {totalSteps}
                </span>
            </div>

            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5 min-h-[60px]">
                {hasOperation ? (
                    <div className="space-y-1.5">
                        {/* LaTeX operation */}
                        <div className="text-base text-indigo-400 mb-1">
                            <InlineMath math={snapshot.latex} />
                        </div>
                        {/* Plain explanation */}
                        <p className="text-sm text-foreground/70">{snapshot.explanation}</p>
                    </div>
                ) : (
                    <p className="text-sm text-foreground/50 italic">
                        {snapshot.explanation}
                    </p>
                )}
            </div>

            {/* Solution status indicators */}
            {snapshot.explanation.includes('RREF') && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-green-400">
                        Solution Complete
                    </span>
                </div>
            )}
            {/* Expandable History */}
            <div className="mt-4 border-t border-white/10 pt-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between text-xs font-semibold text-foreground/50 hover:text-foreground/80 uppercase tracking-wider transition-colors"
                >
                    <span>Operation History</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {snapshots.slice(0, currentStep + 1).map((s, idx) => (
                            <div
                                key={idx}
                                className={`text-xs p-2 rounded-md ${idx === currentStep ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5'}`}
                            >
                                <div className="font-mono text-foreground/50 mb-1">Step {idx + 1}</div>
                                {s.operation ? (
                                    <>
                                        <div className="text-indigo-300 font-semibold mb-1">
                                            <InlineMath math={s.latex} />
                                        </div>
                                        <div className="text-foreground/70">{s.explanation}</div>
                                    </>
                                ) : (
                                    <div className="text-foreground/50 italic">{s.explanation}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

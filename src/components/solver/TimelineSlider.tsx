'use client';

/**
 * TimelineSlider — Auto-solve playback + undo/redo controls.
 *
 * Features:
 * - Undo / Redo buttons
 * - Timeline scrubber
 * - Auto-solve trigger
 * - Speed control
 */

import {
    Undo2,
    Redo2,
    Play,
    Pause,
    SkipForward,
    Zap,
} from 'lucide-react';

interface TimelineSliderProps {
    currentStep: number;
    totalSteps: number;
    canUndo: boolean;
    canRedo: boolean;
    isPlaying: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onJumpTo: (index: number) => void;
    onAutoSolve: () => void;
    onPause: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
}

export default function TimelineSlider({
    currentStep,
    totalSteps,
    canUndo,
    canRedo,
    isPlaying,
    onUndo,
    onRedo,
    onJumpTo,
    onAutoSolve,
    onPause,
    speed,
    onSpeedChange,
}: TimelineSliderProps) {
    return (
        <div className="space-y-2">
            {/* Scrubber */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground/40 min-w-[4rem]">
                    {currentStep + 1} / {totalSteps}
                </span>
                <input
                    type="range"
                    min={0}
                    max={totalSteps - 1}
                    value={currentStep}
                    onChange={(e) => onJumpTo(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-indigo-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-indigo-500/40"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {/* Undo */}
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="Undo"
                >
                    <Undo2 size={16} />
                </button>

                {/* Redo */}
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="Redo"
                >
                    <Redo2 size={16} />
                </button>

                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Auto-solve / Pause */}
                {isPlaying ? (
                    <button
                        onClick={onPause}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
                    >
                        <Pause size={12} />
                        Pause
                    </button>
                ) : (
                    <button
                        onClick={onAutoSolve}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 text-xs font-semibold transition-colors"
                    >
                        <Zap size={12} />
                        Auto-Solve
                    </button>
                )}

                {/* Speed control */}
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-xs text-foreground/40">Speed:</span>
                    {[0.5, 1, 2].map((s) => (
                        <button
                            key={s}
                            onClick={() => onSpeedChange(s)}
                            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${speed === s
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-foreground/40 hover:text-foreground/60 hover:bg-white/5'
                                }`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

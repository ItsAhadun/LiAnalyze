'use client';

/**
 * Navbar — Top navigation bar for Linalyze.
 */

import Link from 'next/link';
import { Moon, Sun, Github } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="h-14 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-screen-2xl mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group"
                >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                        L
                    </div>
                    <span className="text-base font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Linalyze
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                        <Github size={18} />
                    </a>

                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {mounted && resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}

import Link from 'next/link';
import { ArrowRight, BookOpen, Play, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8">
            <Layers size={12} />
            Interactive Linear Algebra
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black text-foreground leading-tight tracking-tight mb-6">
            See the Math.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Feel the Geometry.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-foreground/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Linalyze transforms abstract matrix operations into{' '}
            <span className="text-foreground/70 font-medium">
              explorable 3D visualizations
            </span>
            . Input equations, perform row operations, and watch planes tilt,
            merge, and intersect — step by step.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/solver"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 group"
            >
              <Play size={16} />
              Start Solving
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-foreground font-semibold text-sm border border-white/10 transition-colors"
            >
              <BookOpen size={16} />
              Learn More
            </a>
          </div>

          {/* Feature Cards */}
          <div id="features" className="grid md:grid-cols-3 gap-4 text-left">
            {[
              {
                title: '3D Visualization',
                description:
                  'Watch planes rotate, tilt, and intersect in real-time as you perform row operations.',
                icon: '🎬',
                gradient: 'from-indigo-500/10 to-indigo-500/5',
                border: 'border-indigo-500/10',
              },
              {
                title: 'Step-by-Step Solver',
                description:
                  'eMathHelp-style explanations with every operation. Understand the "why", not just the "what".',
                icon: '📜',
                gradient: 'from-violet-500/10 to-violet-500/5',
                border: 'border-violet-500/10',
              },
              {
                title: 'Interactive Controls',
                description:
                  'Swap, scale, and add rows manually or auto-solve with timeline scrubbing and undo/redo.',
                icon: '🎛️',
                gradient: 'from-purple-500/10 to-purple-500/5',
                border: 'border-purple-500/10',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl bg-gradient-to-b ${feature.gradient} border ${feature.border} p-6 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200`}
              >
                <span className="text-2xl mb-3 block">{feature.icon}</span>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center">
          <p className="text-xs text-foreground/30">
            Built with Next.js, React-Three-Fiber & Supabase.{' '}
            <span className="text-foreground/40">
              © 2026 Linalyze
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

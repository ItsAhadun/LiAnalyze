import Navbar from '@/components/layout/Navbar';
import SolverWorkspace from '@/components/solver/SolverWorkspace';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Solver | Linalyze',
    description: 'Interactive linear algebra solver with 3D visualization',
};

export default function SolverPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <SolverWorkspace />
        </div>
    );
}

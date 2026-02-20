import Navbar from '@/components/layout/Navbar';
import SolverWorkspace from '@/components/solver/SolverWorkspace';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Solver | Linalyze',
    description: 'Interactive linear algebra solver with 3D visualization',
};

export default function SolverPage() {
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden w-full">
            <Navbar />
            <SolverWorkspace />
        </div>
    );
}

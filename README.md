# Linalyze

**Bridge the gap between abstract matrix operations and 3D geometric intuition.**

Linalyze is an interactive linear algebra visualization tool that transforms systems of linear equations into explorable 3D geometric scenes. Watch planes rotate, tilt, and intersect in real-time as you perform Gaussian elimination steps.

## 🚀 Key Features

- **3D Plane Visualization**: See equations as planes (or lines in 2D) that animate smoothly as coefficients change.
- **Interactive Row Operations**: Manually swap, scale, and add rows. Enter scalars as decimals or fractions (e.g., `1/2`).
- **Step-by-Step Solver**: Auto-solve systems with an iterative Gauss-Jordan generator.
- **Human-Readable Explanations**: eMathHelp-style explanations with LaTeX notation for every single step.
- **History & Timeline**: Undo/redo any operation, scrub through the timeline, and view a complete history of the solution process.
- **Modern Tech Stack**: Built with Next.js 16 (App Router), React 19, React-Three-Fiber, Tailwind CSS v4, and Lucide Icons.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **3D Engine**: [React-Three-Fiber](https://docs.pmnd.rs/react-three-fiber) & [Three.js](https://threejs.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Math & LaTeX**: [Math.js](https://mathjs.org/), [KaTeX](https://katex.org/), and [react-katex](https://github.com/talyssonoc/react-katex)
- **State Management**: Custom `useHistory` hook with `useReducer`
- **Backend & Auth**: [Supabase](https://supabase.com/) (Integrated via supa-next-starter)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm (pnpm also supported if installed)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/[YOUR_USERNAME]/LiAnalyze.git
    cd LiAnalyze
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1.  **Input Phase**: Enter your linear system coefficients and constants in the grid. Select 2D (2 variables) or 3D (3 variables) mode.
2.  **Visualization**: Observe how the initial equations map to planes in the 3D scene.
3.  **Solving**:
    - Use the **Row Operations** toolbar to apply elementary operations manually.
    - Click **Auto-Solve** to watch the Gauss-Jordan algorithm reach RREF automatically.
    - Expand the **Operation History** in the explanation panel to see where you've been.
4.  **Navigation**: Use your mouse to rotate (drag), zoom (scroll), and pan (right-drag) the 3D view.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License.

"use client"

import { useEffect, useState } from "react"

export default function GridBackground() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-black">
            {/* Grid pattern */}
            <div className="absolute inset-0 grid-background opacity-20"></div>

            {/* Gradient overlays */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-green-900/20 via-transparent to-transparent opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-green-900/10 via-transparent to-transparent opacity-30"></div>

            {/* Animated accent lines */}
            <div className="absolute inset-0">
                {/* Horizontal accent lines */}
                <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent animate-pulse-slow"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse-slower"></div>

                {/* Vertical accent lines */}
                <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-pulse-slow"></div>
                <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent animate-pulse-slower"></div>
            </div>

            {/* Glowing dots at intersections */}
            <div className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full bg-green-400/50 animate-glow"></div>
            <div className="absolute top-1/4 left-2/3 w-1 h-1 rounded-full bg-green-400/50 animate-glow-delay"></div>
            <div className="absolute top-2/3 left-1/3 w-1 h-1 rounded-full bg-green-400/50 animate-glow-delay"></div>
            <div className="absolute top-2/3 left-2/3 w-1 h-1 rounded-full bg-green-400/50 animate-glow"></div>

            {/* Floating elements */}
            {mounted && (
                <>
                    <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-green-500/5 backdrop-blur-3xl animate-float-slow"></div>
                    <div className="absolute top-[60%] left-[80%] w-48 h-48 rounded-full bg-green-500/5 backdrop-blur-3xl animate-float"></div>
                    <div className="absolute top-[80%] left-[20%] w-40 h-40 rounded-full bg-green-500/5 backdrop-blur-3xl animate-float-delay"></div>
                </>
            )}

            {/* SVG patterns */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="0.5"></path>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>

            {/* Circuit-like patterns */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <g stroke="rgba(34, 197, 94, 0.3)" fill="none" strokeWidth="0.5">
                    <path d="M 100,100 L 200,100 L 200,200" className="animate-draw-line"></path>
                    <path d="M 300,200 L 400,200 L 400,300" className="animate-draw-line-delay"></path>
                    <path d="M 500,100 L 600,100 L 600,300 L 500,300" className="animate-draw-line-delay-2"></path>
                    <path d="M 700,200 C 750,100 800,300 850,200" className="animate-draw-line"></path>
                    <path d="M 100,400 L 300,400 L 300,500 L 500,500" className="animate-draw-line-delay"></path>
                    <path d="M 600,400 L 800,400 L 800,500" className="animate-draw-line-delay-2"></path>
                </g>
            </svg>
        </div>
    )
}


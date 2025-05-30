"use client"

import { motion } from "framer-motion"
import { BrainCircuit, FileText, Sparkles, CheckCircle } from "lucide-react"
import React, { useState, useEffect } from "react"

// AI model visualization component
const AIProcessingAnimation = () => {
    return (
        <div className="relative h-[120px] mt-4 mb-2 overflow-hidden">
            {/* Neural network nodes */}
            {[...Array(3)].map((_, layerIndex) => (
                <React.Fragment key={layerIndex}>
                    {[...Array(4)].map((_, nodeIndex) => (
                        <motion.div
                            key={`node-${layerIndex}-${nodeIndex}`}
                            className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-600"
                            style={{
                                left: `${20 + layerIndex * 30}%`,
                                top: `${20 + nodeIndex * 20}px`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.2, 1],
                                opacity: [0, 0.8, 1],
                            }}
                            transition={{
                                duration: 0.6,
                                delay: layerIndex * 0.3 + nodeIndex * 0.1,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </React.Fragment>
            ))}

            {/* Connecting lines between layers */}
            {[...Array(2)].map((_, connectionIndex) => (
                <React.Fragment key={connectionIndex}>
                    {[...Array(4)].map((_, startNode) => (
                        <React.Fragment key={startNode}>
                            {[...Array(4)].map((_, endNode) => (
                                <motion.div
                                    key={`connection-${connectionIndex}-${startNode}-${endNode}`}
                                    className="absolute h-px bg-gradient-to-r from-blue-400/30 to-purple-600/30"
                                    style={{
                                        left: `${20 + connectionIndex * 30 + 1.5}%`,
                                        top: `${26 + startNode * 20}px`,
                                        width: `${28}%`,
                                        transformOrigin: "left",
                                        transform: `rotate(${(endNode - startNode) * 5}deg)`
                                    }}
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 0.6 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: connectionIndex * 0.3 + startNode * 0.1 + endNode * 0.05 + 0.8,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}

            {/* AI processing indicator */}
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-blue-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
            >
                AI Processing
            </motion.div>

            {/* Floating data points */}
            {['Skills', 'Experience', 'Education', 'Projects', 'Keywords', 'Achievements'].map((data, i) => (
                <motion.div
                    key={`data-${i}`}
                    className="absolute text-xs px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary/80"
                    style={{
                        top: `${Math.random() * 60 + 10}px`,
                        left: `${Math.random() * 70 + 10}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.8, 1, 1, 0.9]
                    }}
                    transition={{
                        duration: 3,
                        delay: i * 0.7,
                        repeat: Infinity,
                        repeatDelay: 4
                    }}
                >
                    {data}
                </motion.div>
            ))}
        </div>
    )
}

export default function Skeleton() {
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)

    // Total steps in the process
    const totalSteps = 4

    const stepDuration = 14

    useEffect(() => {
        // Function to advance to next step
        const advanceStep = () => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1)
            }
        }

        // Set up timer to advance steps
        const timer = setTimeout(() => {
            advanceStep()
        }, stepDuration * 1000)

        // Update progress based on current step
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const stepProgress = (currentStep * 100 / totalSteps)
                const maxProgress = ((currentStep + 1) * 100 / totalSteps)

                if (prev < maxProgress) {
                    return Math.min(prev + 0.2, maxProgress) // Slower increment for smoother progress
                }
                return prev
            })
        }, 50)

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
        }
    }, [currentStep])

    // Define steps data
    const steps = [
        {
            icon: <FileText className="h-4 w-4" />,
            label: "Extracting resume information"
        }, {
            icon: <BrainCircuit className="h-4 w-4" />,
            label: "Processing with AI algorithms"
        },
        {
            icon: <BrainCircuit className="h-4 w-4" />,
            label: "Applying LLM enrichment"
        },
        {
            icon: <Sparkles className="h-4 w-4" />,
            label: "Generating career insights"
        }
    ]

    return (
        <div className="relative p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-primary/20 overflow-hidden">
            {/* Background circuit pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="currentColor" fill="none" strokeWidth="0.5">
                        <path d="M 100,100 L 200,100 L 200,200" className="animate-draw-line"></path>
                        <path d="M 300,200 L 400,200 L 400,300" className="animate-draw-line-delay"></path>
                        <path d="M 500,100 L 600,100 L 600,300 L 500,300" className="animate-draw-line-delay-2"></path>
                        <path d="M 700,200 C 750,100 800,300 850,200" className="animate-draw-line"></path>
                    </g>
                </svg>
            </div>

            {/* Glowing orb backgrounds */}
            <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-green-500/10 blur-xl animate-pulse-slower"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-xl animate-pulse-slow"></div>

            {/* Header with pulsing dot */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <h3 className="text-sm font-medium text-green-500">Processing Resume Data</h3>
            </div>

            <h2 className="text-xl font-bold mb-3">Building Your Career Profile</h2>            <p className="text-muted-foreground text-sm mb-2">
                Our Generative AI is analyzing your resume to create structured data for a comprehensive career assessment...
            </p>{/* AI Processing Visualization - Show during the AI processing step */}
            {currentStep === 1 && <AIProcessingAnimation />}

            {/* Sequential progress steps */}
            <div className="space-y-6 relative z-10">
                {steps.map((step, index) => (
                    <SequentialProgressStep
                        key={index}
                        icon={step.icon}
                        label={step.label}
                        isActive={index === currentStep}
                        isCompleted={index < currentStep}
                        isUpcoming={index > currentStep}
                        duration={stepDuration - 0.2} // Slightly shorter than step change time
                    />
                ))}
            </div>

            {/* Animated progress bar */}
            <div className="mt-8 relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
                This usually takes about 50 seconds depending on the complexity of your resume
            </p>
        </div>
    )
}

// Sequential progress step component
function SequentialProgressStep({
    icon,
    label,
    isActive,
    isCompleted,
    isUpcoming,
    duration
}: {
    icon: React.ReactNode
    label: string
    isActive: boolean
    isCompleted: boolean
    isUpcoming: boolean
    duration: number
}) {
    return (
        <div className="flex items-center gap-3">
            <motion.div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${isCompleted
                    ? "bg-green-500/20"
                    : isActive
                        ? "bg-primary/20"
                        : "bg-primary/5"
                    }`}
                animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                    transition: {
                        repeat: isActive ? Infinity : 0,
                        duration: 1.5
                    }
                }}
            >
                <motion.div
                    className={`${isCompleted
                        ? "text-green-500"
                        : isActive
                            ? "text-primary"
                            : "text-muted-foreground/50"
                        }`}
                    animate={{
                        opacity: isActive ? [0.7, 1, 0.7] : isCompleted ? 1 : 0.5
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : icon}
                </motion.div>
            </motion.div>

            <motion.div
                className="flex-1"
                animate={{
                    opacity: isUpcoming ? 0.5 : 1
                }}
            >
                <motion.div
                    className="h-5 flex items-center"
                    animate={{
                        opacity: isActive ? [0.8, 1, 0.8] : 1
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    <span className={`text-sm ${isUpcoming ? "text-muted-foreground/50" : ""}`}>{label}</span>
                </motion.div>

                <motion.div
                    className="mt-1 h-1 rounded-full bg-primary/10 overflow-hidden"
                >
                    <motion.div
                        className={`h-full rounded-full ${isCompleted
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-green-500/60 to-blue-500/60"
                            }`}
                        animate={{
                            width: isCompleted
                                ? "100%"
                                : isActive
                                    ? ["0%", "100%"]
                                    : "0%"
                        }}
                        transition={{
                            duration: isActive ? duration : 0,
                            ease: "easeInOut",
                            repeat: 0
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}
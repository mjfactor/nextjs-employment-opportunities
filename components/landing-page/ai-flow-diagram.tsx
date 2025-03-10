"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Trees, BrainCircuit, ArrowRight, FileText, User, Briefcase, GraduationCap } from "lucide-react"

export default function AIFlowDiagram() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Add this animationSequence function at the top of the component
  const animationSequence = useCallback(() => {
    // Start with a clean state
    setActiveStep(null)
    setAnimationComplete(false)

    // Schedule the animation steps with requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      // First step after a short delay
      setTimeout(() => {
        setActiveStep(0)

        // Second step
        setTimeout(() => {
          setActiveStep(1)

          // Third step
          setTimeout(() => {
            setActiveStep(2)

            // Complete animation
            setTimeout(() => {
              setActiveStep(null)
              setAnimationComplete(true)
            }, 1500)
          }, 1500)
        }, 1500)
      }, 500)
    })
  }, [])

  // Optimize the animation performance in the AI Flow Diagram
  // Replace the useEffect for auto-animation with this optimized version
  useEffect(() => {
    // Use a single timeout for better performance
    const animationSequence = () => {
      // Start with a clean state
      setActiveStep(null)
      setAnimationComplete(false)

      // Schedule the animation steps with requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        // First step after a short delay
        setTimeout(() => {
          setActiveStep(0)

          // Second step
          setTimeout(() => {
            setActiveStep(1)

            // Third step
            setTimeout(() => {
              setActiveStep(2)

              // Complete animation
              setTimeout(() => {
                setActiveStep(null)
                setAnimationComplete(true)
              }, 1500)
            }, 1500)
          }, 1500)
        }, 500)
      })
    }

    // Start the animation sequence
    animationSequence()

    // No cleanup needed as we're using a single animation sequence
  }, [])

  // Replace the handleContainerHover function with this optimized version
  const handleContainerHover = useCallback(() => {
    if (animationComplete) {
      animationSequence()
    }
  }, [animationComplete, animationSequence])

  return (
    <div ref={containerRef} className="py-8 px-4 relative" onMouseEnter={handleContainerHover}>
      <h3 className="text-xl font-semibold text-white mb-8 text-center">Enhanced Career Analysis Process</h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
        {/* Random Forest Model */}
        <motion.div
          className={`flex flex-col items-center text-center p-6 rounded-lg border ${activeStep === 0 ? "border-green-500 bg-zinc-900/80" : "border-zinc-800 bg-zinc-900/40"} transition-all duration-300 w-full md:w-1/3 relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
        >
          <div
            className={`rounded-full p-4 ${activeStep === 0 ? "bg-green-500/20" : "bg-zinc-800"} transition-all duration-300 mb-4`}
          >
            <Trees
              className={`h-8 w-8 ${activeStep === 0 ? "text-green-400" : "text-green-600"} transition-all duration-300`}
            />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Random Forest Model</h4>
          <p className="text-zinc-400 text-sm">Analyzes patterns in career data using ensemble learning</p>

          {/* Animated trees */}
          {activeStep === 0 && (
            <>
              <motion.div
                className="absolute -top-4 -left-4 opacity-30"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Trees className="h-6 w-6 text-green-500" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 opacity-30"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Trees className="h-6 w-6 text-green-500" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-8 opacity-30"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Trees className="h-6 w-6 text-green-500" />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Arrow 1 */}
        <motion.div
          className="flex justify-center items-center my-4 md:my-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ArrowRight
            className={`h-8 w-8 ${activeStep === 0 ? "text-green-500" : "text-zinc-700"} transition-all duration-300 hidden md:block`}
          />
          <ArrowRight
            className={`h-8 w-8 ${activeStep === 0 ? "text-green-500" : "text-zinc-700"} transition-all duration-300 rotate-90 md:hidden`}
          />

          {/* Data flow animation */}
          {activeStep === 0 && (
            <motion.div
              className="absolute h-2 w-2 rounded-full bg-green-500 hidden md:block"
              initial={{ x: "-50px", opacity: 0 }}
              animate={{ x: "50px", opacity: [0, 1, 0] }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                repeatDelay: 0.3,
              }}
            />
          )}
        </motion.div>

        {/* LLM Processing */}
        <motion.div
          className={`flex flex-col items-center text-center p-6 rounded-lg border ${activeStep === 1 ? "border-green-500 bg-zinc-900/80" : "border-zinc-800 bg-zinc-900/40"} transition-all duration-300 w-full md:w-1/3 relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
        >
          <div
            className={`rounded-full p-4 ${activeStep === 1 ? "bg-green-500/20" : "bg-zinc-800"} transition-all duration-300 mb-4`}
          >
            <BrainCircuit
              className={`h-8 w-8 ${activeStep === 1 ? "text-green-400" : "text-green-600"} transition-all duration-300`}
            />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Large Language Model</h4>
          <p className="text-zinc-400 text-sm">Enhances predictions with contextual understanding</p>

          {/* Neural network animation */}
          {activeStep === 1 && (
            <motion.div
              className="absolute inset-0 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-2">
                {Array.from({ length: 36 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-green-500 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(i * 0.01, 0.3), // Cap the maximum delay
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Arrow 2 */}
        <motion.div
          className="flex justify-center items-center my-4 md:my-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ArrowRight
            className={`h-8 w-8 ${activeStep === 1 ? "text-green-500" : "text-zinc-700"} transition-all duration-300 hidden md:block`}
          />
          <ArrowRight
            className={`h-8 w-8 ${activeStep === 1 ? "text-green-500" : "text-zinc-700"} transition-all duration-300 rotate-90 md:hidden`}
          />

          {/* Data flow animation */}
          {activeStep === 1 && (
            <motion.div
              className="absolute h-2 w-2 rounded-full bg-green-500 hidden md:block"
              initial={{ x: "-50px", opacity: 0 }}
              animate={{ x: "50px", opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: 1, repeatType: "loop" }}
            />
          )}
        </motion.div>

        {/* Career Analysis Output */}
        <motion.div
          className={`flex flex-col items-center text-center p-6 rounded-lg border ${activeStep === 2 ? "border-green-500 bg-zinc-900/80" : "border-zinc-800 bg-zinc-900/40"} transition-all duration-300 w-full md:w-1/3 relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
        >
          <div
            className={`rounded-full p-4 ${activeStep === 2 ? "bg-green-500/20" : "bg-zinc-800"} transition-all duration-300 mb-4`}
          >
            <FileText
              className={`h-8 w-8 ${activeStep === 2 ? "text-green-400" : "text-green-600"} transition-all duration-300`}
            />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Enhanced Career Analysis</h4>
          <p className="text-zinc-400 text-sm">Personalized insights and recommendations</p>

          {/* Result animation */}
          {activeStep === 2 && (
            <motion.div
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="rounded-full bg-zinc-800 p-2">
                  <User className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-zinc-400 mt-1">Profile</span>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="rounded-full bg-zinc-800 p-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-zinc-400 mt-1">Career</span>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="rounded-full bg-zinc-800 p-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-zinc-400 mt-1">Skills</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Connection lines */}
      <svg className="absolute top-0 left-0 w-full h-full z-0 hidden md:block" style={{ pointerEvents: "none" }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M150,120 C200,120 250,180 300,180 C350,180 400,120 450,120"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="40"
          strokeLinecap="round"
          opacity="0.1"
        />
      </svg>

      <div className="text-center mt-16">
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
          Our unique approach combines the statistical power of Random Forest models with the contextual understanding
          of Large Language Models to deliver comprehensive career insights.
        </p>

        <motion.div
          className="mt-6 inline-flex items-center text-green-500 text-sm font-medium cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={handleContainerHover}
        >
          <span>Watch the process again</span>
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BrainCircuit, Trees, Sparkles, ChevronDown } from "lucide-react"
import AuthModal from "@/components/landing-page/auth-modal"
import GridBackground from "@/components/landing-page/grid-background"
import FeatureCard from "@/components/landing-page/feature-card"
import { motion, useScroll, useTransform } from "framer-motion"
import AIFlowDiagram from "@/components/landing-page/ai-flow-diagram"
import { cn } from "@/lib/utils"

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0)
    const [activeFeature, setActiveFeature] = useState<number | null>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)

    // Parallax effect
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], [0, -100])

    // Handle scroll for animations
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Scroll to features section
    const scrollToFeatures = () => {
        featuresRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Typing animation text
    const [displayText, setDisplayText] = useState("")
    const phrases = [
        "AI-Powered Career Analysis",
        "Random Forest Integration",
        "Large Language Model",
        "Employment Opportunities"
    ]
    const [phraseIndex, setPhraseIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)

    // Add refs to track state without triggering re-renders
    const displayTextRef = useRef("")
    const phraseIndexRef = useRef(0)
    const isDeletingRef = useRef(false)

    useEffect(() => {
        let typingTimer: NodeJS.Timeout;

        // Update refs initially to match state
        displayTextRef.current = displayText
        phraseIndexRef.current = phraseIndex
        isDeletingRef.current = isDeleting

        const animateText = () => {
            const currentPhrase = phrases[phraseIndexRef.current];
            const typingSpeed = 40; // Faster base typing speed
            const deleteSpeed = 15; // Faster deletion speed
            const pauseBeforeDelete = 1200; // Slightly shorter pause
            const pauseBeforeNextPhrase = 400; // Slightly shorter pause

            // If currently deleting
            if (isDeletingRef.current) {
                // Delete one character
                const newText = displayTextRef.current.substring(0, displayTextRef.current.length - 1);
                displayTextRef.current = newText;
                setDisplayText(newText);

                // If all deleted, switch to typing mode and move to next phrase
                if (newText.length === 0) {
                    isDeletingRef.current = false;
                    setIsDeleting(false);

                    const nextPhraseIndex = (phraseIndexRef.current + 1) % phrases.length;
                    phraseIndexRef.current = nextPhraseIndex;
                    setPhraseIndex(nextPhraseIndex);

                    // Pause before typing the next phrase
                    typingTimer = setTimeout(animateText, pauseBeforeNextPhrase);
                    return;
                }
            }
            // If typing
            else {
                // Add one character
                const newText = currentPhrase.substring(0, displayTextRef.current.length + 1);
                displayTextRef.current = newText;
                setDisplayText(newText);

                // If fully typed, prepare to delete after pause
                if (newText.length === currentPhrase.length) {
                    typingTimer = setTimeout(() => {
                        isDeletingRef.current = true;
                        setIsDeleting(true);
                        animateText();
                    }, pauseBeforeDelete);
                    return;
                }
            }

            // Schedule next animation frame with appropriate speed
            const randomVariation = Math.random() * 10 - 5; // Smaller ±5ms variation
            const speed = isDeletingRef.current ?
                Math.max(10, deleteSpeed + randomVariation) :
                Math.max(5, typingSpeed - displayTextRef.current.length); // Type faster as we progress

            typingTimer = setTimeout(animateText, speed);
        };

        // Start animation
        typingTimer = setTimeout(animateText, 100);

        // Cleanup
        return () => clearTimeout(typingTimer);
    }, []); // No dependencies for smoother animation

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            <GridBackground />

            <header className="relative z-10">
                <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 backdrop-blur-sm">
                            <Trees className="h-5 w-5 text-green-500" />
                            <div className="absolute inset-0 rounded-full border border-green-500/20"></div>
                        </div>
                        <span className="text-xl font-bold text-white">ForestAI</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <AuthModal mode="login" />
                        <AuthModal mode="signup" />
                    </div>
                </nav>
            </header>

            <main className="relative z-10">
                <section ref={heroRef} className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center relative">
                    {/* Animated badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur mb-6"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-green-400">Random Forest + LLM Technology</span>
                    </motion.div>

                    {/* Main heading with typing effect */}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight min-h-[4rem]"
                    >
                        {displayText}
                        <span className="inline-block w-1 h-10 ml-1 bg-green-500 animate-pulse"></span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-lg text-zinc-300 mb-10 max-w-2xl"
                    >
                        ForestAI combines the predictive power of Random Forests with the understanding capabilities of Large
                        Language Models for unprecedented career insights.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 mb-16"
                    >
                        <AuthModal mode="signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto group bg-green-600 hover:bg-green-700">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </AuthModal>

                        <AuthModal mode="login" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white"
                            >
                                Sign In
                            </Button>
                        </AuthModal>
                    </motion.div>

                    {/* AI Flow Diagram */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        style={{ y }}
                        className="relative w-full max-w-5xl mx-auto"
                    >
                        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-green-500/10 blur-[100px]"></div>
                        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-green-500/10 blur-[100px]"></div>

                        <div className="relative py-8 px-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm shadow-2xl overflow-hidden">
                            <AIFlowDiagram />
                        </div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
                        onClick={scrollToFeatures}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-400 text-sm mb-2">Explore Features</span>
                            <ChevronDown className="h-6 w-6 text-green-500 animate-bounce" />
                        </div>
                    </motion.div>
                </section>

                <section ref={featuresRef} id="features" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful AI Capabilities</h2>
                        <p className="text-zinc-300 max-w-2xl mx-auto">
                            Our platform combines the best of decision trees and language models to deliver powerful insights.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            onHoverStart={() => setActiveFeature(0)}
                            onHoverEnd={() => setActiveFeature(null)}
                        >
                            <FeatureCard
                                icon={
                                    <Trees
                                        className={cn(
                                            "h-6 w-6 transition-all duration-300",
                                            activeFeature === 0 ? "text-green-400 scale-125" : "text-green-500",
                                        )}
                                    />
                                }
                                title="Random Forest Predictions"
                                description="Utilize ensemble learning methods to make accurate predictions based on multiple decision trees."
                                isActive={activeFeature === 0}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ scale: 1.03 }}
                            onHoverStart={() => setActiveFeature(1)}
                            onHoverEnd={() => setActiveFeature(null)}
                        >
                            <FeatureCard
                                icon={
                                    <BrainCircuit
                                        className={cn(
                                            "h-6 w-6 transition-all duration-300",
                                            activeFeature === 1 ? "text-green-400 scale-125" : "text-green-500",
                                        )}
                                    />
                                }
                                title="Advanced LLM Integration"
                                description="Leverage state-of-the-art language models to understand and generate human-like text with remarkable accuracy."
                                isActive={activeFeature === 1}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            whileHover={{ scale: 1.03 }}
                            onHoverStart={() => setActiveFeature(2)}
                            onHoverEnd={() => setActiveFeature(null)}
                        >
                            <FeatureCard
                                icon={
                                    <Sparkles
                                        className={cn(
                                            "h-6 w-6 transition-all duration-300",
                                            activeFeature === 2 ? "text-green-400 scale-125" : "text-green-500",
                                        )}
                                    />
                                }
                                title="Hybrid Intelligence"
                                description="Combine the strengths of both technologies for a powerful AI system that excels at both understanding and prediction."
                                isActive={activeFeature === 2}
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Call to action section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
                >
                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-8 overflow-hidden">
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-500/10 blur-[100px]"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    Ready to harness the power of ForestAI?
                                </h2>
                            </div>

                            <AuthModal mode="signup" className="w-full md:w-auto">
                                <Button size="lg" className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </AuthModal>
                        </div>
                    </div>
                </motion.section>
            </main>

            <footer className="relative z-10 border-t border-zinc-800 bg-zinc-900/30 backdrop-blur-sm py-12">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                                <Trees className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-lg font-bold text-white">ForestAI</span>
                            <p className="text-sm text-zinc-500 ml-2">© {new Date().getFullYear()} All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}


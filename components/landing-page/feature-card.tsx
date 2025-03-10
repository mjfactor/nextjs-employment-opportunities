"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
  isActive?: boolean
}

export default function FeatureCard({ icon, title, description, className, isActive = false }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "bg-zinc-900/50 border-zinc-800 backdrop-blur-sm transition-all duration-300 group overflow-hidden",
        isActive ? "border-green-500/50 bg-zinc-900/70" : "hover:border-green-500/30",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-full p-2 transition-colors duration-300",
              isActive ? "bg-black/70" : "bg-black/50 group-hover:bg-black/70",
            )}
          >
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-300">{description}</p>

        {isActive && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
            className="h-0.5 bg-gradient-to-r from-green-500/80 to-transparent mt-4"
          />
        )}
      </CardContent>
    </Card>
  )
}


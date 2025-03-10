"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Node {
  id: string
  x: number
  y: number
  radius: number
  color: string
  label: string
  children: Node[]
}

export default function DecisionTreeVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Create tree structure
  useEffect(() => {
    if (isInitialized) return

    const createTree = (depth: number, maxDepth: number, x: number, y: number, parentId = ""): Node => {
      const id = parentId ? `${parentId}-${depth}` : "root"
      const node: Node = {
        id,
        x,
        y,
        radius: 12 - depth * 1.5,
        color: depth === 0 ? "#22c55e" : depth === maxDepth ? "#f59e0b" : "#10b981",
        label:
          depth === 0
            ? "Age > 30?"
            : depth === maxDepth
              ? "Prediction"
              : depth % 2 === 0
                ? "Income > 50K?"
                : "Education > 12y?",
        children: [],
      }

      if (depth < maxDepth) {
        const spacing = 120 / 2 ** depth
        node.children.push(
          createTree(depth + 1, maxDepth, x - spacing, y + 60, `${id}-0`),
          createTree(depth + 1, maxDepth, x + spacing, y + 60, `${id}-1`),
        )
      }

      return node
    }

    const rootNode = createTree(0, 3, 0, 30)
    setNodes([rootNode])
    setIsInitialized(true)
  }, [isInitialized])

  // Draw the tree
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 600
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Center the tree
    const centerX = canvas.width / 2
    const centerY = 20

    // Draw connections
    const drawConnections = (node: Node, parentX?: number, parentY?: number) => {
      if (parentX !== undefined && parentY !== undefined) {
        ctx.beginPath()
        ctx.moveTo(centerX + parentX, parentY)
        ctx.lineTo(centerX + node.x, node.y)
        ctx.strokeStyle = hoveredNode === node.id ? "#22c55e" : "rgba(34, 197, 94, 0.5)"
        ctx.lineWidth = hoveredNode === node.id ? 2 : 1
        ctx.stroke()
      }

      node.children.forEach((child) => {
        drawConnections(child, node.x, node.y)
      })
    }

    // Draw nodes
    const drawNode = (node: Node) => {
      // Draw node
      ctx.beginPath()
      ctx.arc(centerX + node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = hoveredNode === node.id ? "#4ade80" : node.color
      ctx.fill()

      // Draw border
      ctx.beginPath()
      ctx.arc(centerX + node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw label
      if (node.id === "root" || node.children.length === 0) {
        ctx.fillStyle = "white"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label.split("?")[0], centerX + node.x, node.y + node.radius + 12)
      }

      // Recursively draw children
      node.children.forEach((child) => {
        drawNode(child)
      })
    }

    // Draw the tree
    nodes.forEach((rootNode) => {
      drawConnections(rootNode)
      drawNode(rootNode)
    })

    // Handle mouse interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const checkNodeHover = (node: Node): boolean => {
        const dx = mouseX - (centerX + node.x)
        const dy = mouseY - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < node.radius) {
          setHoveredNode(node.id)
          return true
        }

        for (const child of node.children) {
          if (checkNodeHover(child)) {
            return true
          }
        }

        return false
      }

      let foundHover = false
      for (const node of nodes) {
        if (checkNodeHover(node)) {
          foundHover = true
          break
        }
      }

      if (!foundHover && hoveredNode !== null) {
        setHoveredNode(null)
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [nodes, hoveredNode])

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <h3 className="text-xl font-semibold text-white mb-4">Interactive Decision Tree</h3>
      <p className="text-zinc-400 mb-6 text-sm max-w-md text-center">
        Hover over nodes to explore the decision paths that power our random forest model
      </p>
      <div className="relative">
        <canvas ref={canvasRef} width={600} height={300} className="mx-auto" />

        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 right-0 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-xs text-white"
          >
            {hoveredNode === "root" ? (
              <span>Root node: Determines initial split based on age</span>
            ) : hoveredNode.includes("-3") ? (
              <span>Leaf node: Final prediction based on previous conditions</span>
            ) : (
              <span>Decision node: Evaluates feature to determine path</span>
            )}
          </motion.div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-400">Root</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-zinc-400">Decision</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-zinc-400">Prediction</span>
          </div>
        </div>
      </div>
    </div>
  )
}


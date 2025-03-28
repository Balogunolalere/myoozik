"use client"

import { motion } from "framer-motion"
import { Disc } from "lucide-react"

interface VinylSpinnerProps {
  size?: number
  className?: string
}

export function VinylSpinner({ size = 40, className = "" }: VinylSpinnerProps) {
  const grooveCount = 8
  const grooves = Array.from({ length: grooveCount })

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Vinyl record base */}
        <div className="absolute inset-0 bg-black rounded-full opacity-90" />
        
        {/* Record grooves */}
        {grooves.map((_, index) => (
          <div
            key={index}
            className="absolute inset-0 border border-gray-600 rounded-full opacity-30"
            style={{
              margin: `${(index + 1) * (size / (grooveCount * 2))}px`,
              animation: `groove-shine ${2 + index * 0.5}s linear infinite`
            }}
          />
        ))}
        
        {/* Center label */}
        <div 
          className="absolute rounded-full bg-[#FD6C6C] flex items-center justify-center overflow-hidden"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-[20%] h-[20%] bg-black rounded-full" />
        </div>

        {/* Reflection effect */}
        <div 
          className="absolute inset-0 rounded-full" 
          style={{
            background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 52%, transparent 55%)'
          }}
        />
      </motion.div>
    </div>
  )
}
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Music, Disc, Radio, Headphones, Mic, Heart } from "lucide-react"

export function FloatingIcons() {
  const icons = [Music, Disc, Radio, Headphones, Mic, Heart]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Return nothing during SSR
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute text-black/10"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 500),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 500),
            rotate: Math.random() * 360,
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 500),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 500),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 500),
            ],
            y: [
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 500),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 500),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 500),
            ],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 30,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Icon size={30 + Math.random() * 50} />
        </motion.div>
      ))}
    </div>
  )
}

export function RetroPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
          radial-gradient(circle, #FF6B6B 1px, transparent 1px),
          radial-gradient(circle, #4ECDC4 1px, transparent 1px),
          radial-gradient(circle, #FFE66D 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px, 30px 30px, 20px 20px",
          backgroundPosition: "0 0, 15px 15px, 30px 30px",
        }}
      />
    </div>
  )
}

export function RetroWaves({ className = "" }) {
  return (
    <div className={`${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0,0 C150,40 350,0 500,30 C650,60 750,0 900,20 C1050,40 1150,10 1200,30 L1200,120 L0,120 Z"
          fill="#FF6B6B"
          opacity="0.2"
        />
        <path
          d="M0,20 C150,60 350,20 500,50 C650,80 750,20 900,40 C1050,60 1150,30 1200,50 L1200,120 L0,120 Z"
          fill="#4ECDC4"
          opacity="0.2"
        />
        <path
          d="M0,40 C150,80 350,40 500,70 C650,100 750,40 900,60 C1050,80 1150,50 1200,70 L1200,120 L0,120 Z"
          fill="#FFE66D"
          opacity="0.2"
        />
      </svg>
    </div>
  )
}

export function DoodleBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-2 border-4 border-black rounded-xl"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2 }}
      />
      {children}
    </div>
  )
}

export function MarqueeText({ text }: { text: string }) {
  return (
    <div className="marquee-container bg-gradient-to-r from-accent to-secondary border-y-4 border-black py-2 overflow-hidden">
      <div className="marquee-content whitespace-nowrap">
        {Array(10)
          .fill(text)
          .map((t, i) => (
            <span key={i} className="mx-4 text-xl font-bold" style={{ fontFamily: "var(--font-marker)" }}>
              {t} <span className="mx-2">♪</span>
            </span>
          ))}
      </div>
    </div>
  )
}

export function VinylRecord({ size = 100 }: { size?: number }) {
  return (
    <motion.div
      className="rounded-full bg-black relative"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    >
      <div
        className="absolute rounded-full bg-primary"
        style={{
          width: size / 3,
          height: size / 3,
          top: size / 3,
          left: size / 3,
        }}
      />
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: size / 10,
          height: size / 10,
          top: size * 0.45,
          left: size * 0.45,
        }}
      />
      <div className="absolute inset-0 rounded-full border-4 border-white opacity-10" />
    </motion.div>
  )
}

export function CassetteTape({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-black aspect-[3/2] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-black flex items-center justify-center">
          <div className="w-3/4 h-3/4 border-2 border-black rounded-full flex items-center justify-center">
            <motion.div
              className="w-1/2 h-1/2 bg-black rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
        </div>
        <div className="absolute bottom-1 left-1 right-1 h-1/6 bg-black/20 flex justify-between px-2">
          <div className="w-1/4 h-full bg-black/30" />
          <div className="w-1/4 h-full bg-black/30" />
        </div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[8px] font-bold">MIXTAPE</div>
      </div>
    </div>
  )
}


"use client"

import { motion } from "framer-motion"
import { Music, Disc, Radio } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-[#FD6C6C] border-t-4 border-black mt-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-bold" style={{ fontFamily: "var(--font-marker)" }}>
            myo͞ozik © {new Date().getFullYear()}
          </p>
          <p className="text-sm mt-2" style={{ fontFamily: "var(--font-indie)" }}>
            A retro-indie social YouTube music playlist rating website
          </p>
        </motion.div>
      </div>
    </footer>
  )
}


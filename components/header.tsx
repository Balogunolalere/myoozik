"use client"

import Link from "next/link"
import { useState } from "react"
import { Disc, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary border-b-4 border-black sticky top-0 z-50 vhs-effect">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Disc className="h-8 w-8" />
          </motion.div>
          <motion.h1
            className="text-2xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-marker)" }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            myo͞ozik
          </motion.h1>
        </Link>

        <nav className="hidden md:flex gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="neobrutalist-button">
              Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/add-playlist" className="neobrutalist-button">
              Add Playlist
            </Link>
          </motion.div>
        </nav>

        <div className="md:hidden">
          <motion.button
            className="neobrutalist-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b-4 border-black"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex flex-col gap-4">
              <Link href="/" className="neobrutalist-button w-full text-center" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link
                href="/add-playlist"
                className="neobrutalist-button w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Playlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


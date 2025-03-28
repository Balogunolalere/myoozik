"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaylistForm } from "@/components/playlist-form"
import { FloatingIcons, MarqueeText, VinylRecord } from "@/components/decorative-elements"
import { motion } from "framer-motion"

export default function AddPlaylistPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {isMounted && <FloatingIcons />}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold mb-6 text-center"
          style={{ fontFamily: "var(--font-marker)" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Add a YouTube Playlist
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PlaylistForm />
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            {
              title: "Discover",
              description: "Find new music from other users' playlists",
              icon: <VinylRecord size={80} />,
            },
            {
              title: "Share",
              description: "Share your favorite YouTube playlists with others",
              icon: <VinylRecord size={80} />,
            },
            {
              title: "Rate",
              description: "Rate playlists and leave comments anonymously",
              icon: <VinylRecord size={80} />,
            },
          ].map((item, index) => (
            <motion.div key={index} className="neobrutalist-container text-center" whileHover={{ y: -5 }}>
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: "var(--font-indie)" }}>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <MarqueeText text="ADD • SHARE • DISCOVER • ENJOY" />

      <Footer />
    </div>
  )
}


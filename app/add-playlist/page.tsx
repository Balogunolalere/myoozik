"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaylistForm } from "@/components/playlist-form"
import { motion } from "framer-motion"

export default function AddPlaylistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
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
              icon: "🎵",
            },
            {
              title: "Share",
              description: "Share your favorite YouTube playlists with others",
              icon: "🎶",
            },
            {
              title: "Rate",
              description: "Rate playlists and leave comments anonymously",
              icon: "⭐",
            },
          ].map((item, index) => (
            <motion.div 
              key={index} 
              className="neobrutalist-container text-center bg-[#FD6C6C]" 
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center mb-4 text-4xl">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: "var(--font-indie)" }}>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}


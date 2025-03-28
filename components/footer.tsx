"use client"

import { motion } from "framer-motion"
import { Music, Disc, Radio } from "lucide-react"
import { CassetteTape } from "./decorative-elements"

export function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-gradient-to-r from-primary to-secondary border-t-4 border-black mt-auto vhs-effect">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex gap-8">
            {[
              <Music key="music" className="h-8 w-8" />,
              <CassetteTape key="cassette" className="w-12 h-8" />,
              <Disc key="disc" className="h-8 w-8" />,
              <Radio key="radio" className="h-8 w-8" />,
            ].map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  delay: index * 0.2,
                }}
              >
                {Icon}
              </motion.div>
            ))}
          </div>
        </div>

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


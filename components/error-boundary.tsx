"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <motion.div 
              className="neobrutalist-container bg-red-100 text-center py-12 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-red-600 mb-4" style={{ fontFamily: "var(--font-marker)" }}>
                Something went wrong
              </h2>
              <p className="text-red-600 mb-4" style={{ fontFamily: "var(--font-indie)" }}>
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <motion.button 
                onClick={() => window.location.reload()}
                className="neobrutalist-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          </main>
          <Footer />
        </div>
      )
    }

    return this.props.children
  }
}
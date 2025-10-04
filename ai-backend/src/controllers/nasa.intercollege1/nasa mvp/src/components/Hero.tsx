'use client'

import { motion } from 'framer-motion'
import { Rocket, Sparkles, Globe, Dna } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function Hero() {
  const { data: session } = useSession()

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cosmic-cyan/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cosmic-pink/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-cosmic-cyan" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cosmic-cyan via-cosmic-purple to-cosmic-pink bg-clip-text text-transparent">
                Space Biology
              </h1>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <Dna className="w-12 h-12 text-cosmic-pink" />
              </motion.div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Knowledge Engine
            </h2>
            <div className="flex justify-center items-center space-x-2 text-xl md:text-2xl text-white/80">
              <Globe className="w-6 h-6 text-cosmic-cyan" />
              <span>Powered by NASA • AI • Research</span>
              <Rocket className="w-6 h-6 text-cosmic-purple" />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Explore the frontiers of space biology with our AI-powered research platform. 
            Access NASA datasets, analyze publications, and discover insights about life in space.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {session ? (
              <Link href="/dashboard" className="cosmic-button text-lg px-8 py-4 inline-flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                Launch Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="cosmic-button text-lg px-8 py-4 inline-flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  Start Exploring
                </Link>
                <Link href="/demo" className="nasa-button text-lg px-8 py-4 inline-flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Try Demo
                </Link>
              </>
            )}
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="space-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cosmic-cyan to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">NASA Integration</h3>
              <p className="text-white/70 text-sm">Direct access to NASA's space biology datasets and research</p>
            </div>
            
            <div className="space-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cosmic-purple to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-white/70 text-sm">Advanced RAG chatbot with multi-source knowledge integration</p>
            </div>
            
            <div className="space-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Source</h3>
              <p className="text-white/70 text-sm">ArXiv, PubMed, CrossRef, and NASA data in one platform</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

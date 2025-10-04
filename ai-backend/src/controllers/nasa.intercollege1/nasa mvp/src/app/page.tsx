'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Rocket, Database, Bot, BarChart3, GraduationCap, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { FeatureCard } from '@/components/FeatureCard'

const features = [
  {
    icon: Database,
    title: 'Publications Hub',
    description: 'Upload, analyze, and manage space biology research papers with AI-powered summarization',
    href: '/publications',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Bot,
    title: 'AI Research Assistant',
    description: 'Chat with our RAG-powered AI that understands NASA datasets, ArXiv, PubMed, and CrossRef',
    href: '/chatbot',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Knowledge Graphs',
    description: 'Visualize relationships between genes, experiments, and space conditions',
    href: '/graphs',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: GraduationCap,
    title: 'Interactive Quizzes',
    description: 'Auto-generated quizzes from research papers for educational purposes',
    href: '/quizzes',
    color: 'from-orange-500 to-red-500'
  }
]

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cosmic-cyan to-cosmic-purple bg-clip-text text-transparent">
              Explore Space Biology Research
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Access cutting-edge tools for space biology research, powered by AI and integrated with NASA datasets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="space-card"
            >
              <div className="text-4xl font-bold text-cosmic-cyan mb-2">10,000+</div>
              <div className="text-white/80">Research Papers</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-card"
            >
              <div className="text-4xl font-bold text-cosmic-purple mb-2">500+</div>
              <div className="text-white/80">NASA Datasets</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-card"
            >
              <div className="text-4xl font-bold text-cosmic-pink mb-2">24/7</div>
              <div className="text-white/80">AI Assistant</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-card"
          >
            <Sparkles className="w-16 h-16 text-cosmic-cyan mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Explore Space Biology?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join researchers worldwide in advancing our understanding of life in space
            </p>
            {session ? (
              <Link href="/dashboard" className="cosmic-button inline-flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/signin" className="cosmic-button inline-flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Get Started
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  color: string
}

export function FeatureCard({ icon: Icon, title, description, href, color }: FeatureCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="space-card h-full cursor-pointer group"
      >
        <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cosmic-cyan transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-white/70 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-6 flex items-center text-cosmic-cyan group-hover:text-cosmic-pink transition-colors duration-300">
          <span className="text-sm font-medium">Explore →</span>
        </div>
      </motion.div>
    </Link>
  )
}

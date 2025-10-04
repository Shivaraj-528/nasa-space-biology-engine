'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Database, 
  Bot, 
  BarChart3, 
  GraduationCap,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Publications', href: '/publications', icon: Database },
  { name: 'Chatbot', href: '/chatbot', icon: Bot },
  { name: 'Graphs', href: '/graphs', icon: BarChart3 },
  { name: 'Quizzes', href: '/quizzes', icon: GraduationCap },
]

export function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Rocket className="w-8 h-8 text-cosmic-cyan" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-cosmic-cyan to-cosmic-purple bg-clip-text text-transparent">
              Space Biology Engine
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-white/80 hover:text-cosmic-cyan transition-colors duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-white/80 hover:text-red-400 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => signIn('google')}
                  className="cosmic-button text-sm"
                >
                  Sign In with Google
                </button>
                <Link
                  href="/demo"
                  className="text-white/80 hover:text-cosmic-cyan transition-colors duration-200"
                >
                  Try Demo
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-cosmic-cyan transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass-effect border-t border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-cosmic-cyan hover:bg-white/5 rounded-md transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-white/10 pt-4 mt-4">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/80">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-white/5 rounded-md transition-all duration-200 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => signIn('google')}
                    className="w-full cosmic-button text-sm"
                  >
                    Sign In with Google
                  </button>
                  <Link
                    href="/demo"
                    className="block px-3 py-2 text-white/80 hover:text-cosmic-cyan hover:bg-white/5 rounded-md transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Try Demo
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

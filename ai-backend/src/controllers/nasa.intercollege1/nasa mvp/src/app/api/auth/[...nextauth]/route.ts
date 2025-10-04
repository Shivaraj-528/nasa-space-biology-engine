import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add user role based on email domain or other criteria
        session.user.role = getUserRole(session.user.email)
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = getUserRole(user.email)
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
})

function getUserRole(email?: string | null): 'student' | 'teacher' | 'researcher' | 'scientist' {
  if (!email) return 'student'
  
  // Simple role assignment based on email domain
  if (email.includes('@nasa.gov') || email.includes('@jpl.nasa.gov')) {
    return 'scientist'
  } else if (email.includes('@edu') || email.includes('.edu')) {
    return email.includes('prof') || email.includes('dr.') ? 'teacher' : 'student'
  } else if (email.includes('@research') || email.includes('@lab')) {
    return 'researcher'
  }
  
  return 'student' // Default role
}

export { handler as GET, handler as POST }

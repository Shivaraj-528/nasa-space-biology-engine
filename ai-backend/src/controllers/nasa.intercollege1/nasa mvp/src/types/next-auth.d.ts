import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'student' | 'teacher' | 'researcher' | 'scientist'
    }
  }

  interface User {
    id: string
    role: 'student' | 'teacher' | 'researcher' | 'scientist'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'student' | 'teacher' | 'researcher' | 'scientist'
  }
}

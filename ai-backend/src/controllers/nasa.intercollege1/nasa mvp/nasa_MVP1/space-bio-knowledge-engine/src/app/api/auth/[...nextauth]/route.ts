import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongo';
import UserModel from '@/lib/models/User';

const hasGoogle = !!process.env.GOOGLE_OAUTH_CLIENT_ID && !!process.env.GOOGLE_OAUTH_SECRET;

export const authOptions = {
  providers: [
    Credentials({
      name: 'Guest',
      credentials: { name: { label: 'Name', type: 'text' } },
      async authorize(credentials) {
        const name = (credentials as any)?.name || 'Guest User';
        return { id: `guest-${Date.now()}`, name, email: 'guest@example.com', role: 'guest' as const } as any;
      },
    }),
    ...(hasGoogle
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_OAUTH_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        await connectToDatabase();
        await UserModel.updateOne(
          { email: user.email },
          { $setOnInsert: { email: user.email, name: user.name, role: 'researcher' } },
          { upsert: true }
        );
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      } else if (!token.role) {
        token.role = 'student';
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} as any;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

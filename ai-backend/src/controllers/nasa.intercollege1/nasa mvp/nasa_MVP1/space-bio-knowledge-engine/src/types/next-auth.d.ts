import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      role?: 'guest' | 'student' | 'teacher' | 'researcher' | 'scientist';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'guest' | 'student' | 'teacher' | 'researcher' | 'scientist';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'guest' | 'student' | 'teacher' | 'researcher' | 'scientist';
  }
}

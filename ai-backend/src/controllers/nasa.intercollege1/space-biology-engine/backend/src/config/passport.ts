import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_SECRET!,
      callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });

        if (user) {
          // Update user info if needed
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
            }
          });
          return done(null, user);
        }

        // Create new user
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Determine user role based on email domain or other criteria
        let role: UserRole = UserRole.STUDENT;
        
        // You can customize this logic based on your requirements
        const emailDomain = email.split('@')[1];
        if (emailDomain?.includes('edu') || emailDomain?.includes('university')) {
          role = UserRole.TEACHER;
        }
        if (emailDomain?.includes('research') || emailDomain?.includes('institute')) {
          role = UserRole.RESEARCHER;
        }
        if (emailDomain?.includes('nasa') || emailDomain?.includes('gov')) {
          role = UserRole.SCIENTIST;
        }

        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            role,
            verified: true // Google OAuth users are considered verified
          }
        });

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        institution: true,
        verified: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

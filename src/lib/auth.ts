import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        
        if (!credentials?.email || !credentials?.password) {
          log.security('Authentication attempt with missing credentials', {
            email: email || 'not_provided',
            reason: 'missing_credentials',
            success: false
          });
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          })

          if (!user || !user.password) {
            log.security('Authentication attempt for non-existent or incomplete user', {
              email,
              userExists: !!user,
              hasPassword: user?.password ? true : false,
              reason: 'user_not_found_or_incomplete',
              success: false
            });
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            log.security('Authentication attempt with invalid password', {
              email,
              userId: user.id,
              reason: 'invalid_password',
              success: false
            });
            return null
          }

          log.security('Successful authentication', {
            email,
            userId: user.id,
            userName: user.name,
            success: true
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
          }
        } catch (error) {
          log.error('Authentication error', {
            email,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : error
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        log.debug('JWT token created', {
          userId: user.id,
          email: user.email,
          type: 'jwt_creation'
        });
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        log.debug('Session created', {
          userId: token.id,
          email: session.user.email,
          type: 'session_creation'
        });
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      log.info('User signed in', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        type: 'sign_in_event'
      });
    },
    async signOut({ token, session }) {
      log.info('User signed out', {
        userId: token?.id || session?.user?.id,
        email: token?.email || session?.user?.email,
        type: 'sign_out_event'
      });
    },
    async createUser({ user }) {
      log.info('New user created', {
        userId: user.id,
        email: user.email,
        type: 'user_creation'
      });
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
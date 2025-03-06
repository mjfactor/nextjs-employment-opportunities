import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma/prisma"
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import Google from "next-auth/providers/google"
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request) {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        // Return null if user doesn't exist or password field is missing
        if (!user || !user.password) {
          return null;
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // Return user if password matches, null otherwise
        return passwordMatch ? user : null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only run for Google OAuth sign-ins
      if (account?.provider === "google" && profile) {
        // Find existing user with the same email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" }
        });

        // If user exists, update their profile with Google data
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.name || user.name,
              image: profile.picture || user.image,
            },
          });
        }
      }
      return true;
    },
  }
})
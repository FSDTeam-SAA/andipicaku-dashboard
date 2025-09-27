import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await axios.post(`${baseURL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          })

          if (response.data.success && response.data.data) {
            const { accessToken, role, user } = response.data.data
            return {
              id: user._id,
              email: user.email,
              name: user.username,
              role: role,
              accessToken: accessToken,
              avatar: user.avatar?.url || "",
              phone: user.phone,
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.role = user.role
        token.avatar = user.avatar
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.role = token.role as string
      session.user.avatar = token.avatar as string
      session.user.phone = token.phone as string
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
}

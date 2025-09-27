declare module "next-auth" {
  interface Session {
    accessToken: string
    user: {
      id: string
      name: string
      email: string
      role: string
      avatar: string
      phone: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    accessToken: string
    avatar: string
    phone: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    role: string
    avatar: string
    phone: string
  }
}

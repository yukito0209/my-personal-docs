import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      githubId: string
      githubUrl: string
      avatar: string
      login: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    githubId: string
    githubUrl: string
    avatar: string
    login: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    githubId: string
    githubUrl: string
    avatar: string
    login: string
  }
} 
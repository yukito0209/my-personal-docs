import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import type { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      },
      httpOptions: {
        timeout: 10000,
      },
      userinfo: "https://api.github.com/user",
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // 首次登录时保存 GitHub 信息
      if (account && profile) {
        const githubProfile = profile as any
        token.githubId = String(githubProfile.id || githubProfile.login || profile.sub || '')
        token.githubUrl = githubProfile.html_url || ''
        token.avatar = githubProfile.avatar_url || profile.image || ''
        token.login = githubProfile.login || ''
      }
      
      return token
    },
    async session({ session, token }) {
      // 将 token 信息传递给 session
      if (session?.user) {
        // 使用 GitHub ID 作为用户唯一标识符，如果没有则使用其他可用的标识符
        session.user.id = (token.githubId as string) || (token.login as string) || token.sub || ''
        session.user.githubId = (token.githubId as string) || ''
        session.user.githubUrl = (token.githubUrl as string) || ''
        session.user.avatar = (token.avatar as string) || session.user.image || ''
        session.user.login = (token.login as string) || ''
      }
      
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    error: '/api/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

 
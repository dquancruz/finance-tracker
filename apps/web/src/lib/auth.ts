import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { User } from 'next-auth';

// Extend next-auth types to carry the API access token.
// JWT augmentation lives here because next-auth/jwt sub-path is not
// resolvable in NextAuth v5 beta without a custom module resolver.
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
  interface User {
    accessToken?: string;
  }
}

interface ApiAuthResponse {
  user: User & { accessToken: string };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!res.ok) return null;

          const data = (await res.json()) as ApiAuthResponse;
          return data.user ?? null;
        } catch {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token['accessToken'] = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      const accessToken = token['accessToken'];
      if (typeof accessToken === 'string') {
        session.accessToken = accessToken;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});

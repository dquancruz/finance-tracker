import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { User } from "next-auth";

// Extend next-auth types to carry the API access token.
// JWT augmentation lives here because next-auth/jwt sub-path is not
// resolvable in NextAuth v5 beta without a custom module resolver.
declare module "next-auth" {
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

async function exchangeGoogleToken(idToken: string): Promise<ApiAuthResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const response = await fetch(`${apiUrl}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google API identity exchange failed");
  return response.json() as Promise<ApiAuthResponse>;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
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
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!account.id_token) return false;

      try {
        const data = await exchangeGoogleToken(account.id_token);
        user.id = data.user.id;
        user.accessToken = data.user.accessToken;
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token["accessToken"] = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      const accessToken = token["accessToken"];
      if (typeof accessToken === "string") {
        session.accessToken = accessToken;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";


interface ExtendedToken extends JWT {
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  error?: string;
}

export interface ExtendedSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken?: string;
  error?: string;
}


async function refreshAccessToken(token: JWT) {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken
      }.toString())

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}


export const authOptions : NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
    jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 60 * 60 * 24 * 30,
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: "openid profile email https://www.googleapis.com/auth/youtube.readonly", // YouTube scope
          },
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, account }) {
        // Initial sign in
        if (account && user) {
          return {
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at ? Date.now() + account.expires_at * 1000 : Date.now() + 3600 * 1000,
            refreshToken: account.refresh_token,
            user
          }
        }
  
        // Return previous token if the access token has not expired yet
        if (account?.expires_at && Date.now() < account?.expires_at) {
          return token
        }
  
        // Access token has expired, try to update it
        return refreshAccessToken(token)
      },
      async session({ session, token } : { session: ExtendedSession, token: JWT}) {
        const extendedToken = token as ExtendedToken;
        session.user = extendedToken.user
        session.accessToken = extendedToken.accessToken
        session.error = extendedToken.error
  
        return session
      }
    }
  }
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { canUserSignup } from "../../../lib/auth";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (await canUserSignup(user.email)) {
        return true;
      }
      return false;
    },
    async session({ session, user, token }) {
      session.user.name = session.user.name ?? null;
      session.user.image = session.user.image ?? null;
      return {
        ...session,
        user: {
          // @ts-expect-error
          id: user.id,
          // @ts-expect-error
          admin: user.admin ?? false,
          ...session.user,
        },
      };
    },
  },
};

export default NextAuth(authOptions);

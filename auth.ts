import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 10 * 24 * 60 * 60 }, // 10 days (matches backend)
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Invalid email or password");
        }

        const { accessToken, refreshToken, user } = json.data;

        // This dashboard is admin-only.
        if (user?.accountType !== "admin") {
          throw new Error("Access denied. This portal is for administrators only.");
        }

        return {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.avatar || null,
          role: user.accountType,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token._id = user._id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.role = token.role as string | undefined;
      session._id = token._id as string | undefined;
      if (session.user) {
        session.user._id = token._id as string | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});

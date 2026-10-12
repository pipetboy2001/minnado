import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config: no Prisma adapter / bcrypt here, since middleware runs
 * in the Edge runtime and those packages depend on Node.js built-ins.
 * The full config (providers, adapter) lives in `auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/actividades");
      return !isProtectedRoute || isLoggedIn;
    },
  },
};

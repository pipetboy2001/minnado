import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Single guard for every /actividades/* route: no session, no access.
 * Without this, individual pages had to remember to call auth() and
 * redirect themselves — some (lesson, practica) never did, leaving them
 * open to anonymous visitors; others handled a missing session
 * inconsistently (session! vs session?.user?.x ?? fallback). Pages can
 * now rely on a session existing — next-auth's auth() is request-scoped
 * cached, so calling it again in a page is cheap and returns the same
 * result checked here.
 */
export default async function ActividadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return children;
}

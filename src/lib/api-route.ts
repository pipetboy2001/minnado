import { NextResponse } from "next/server";

/**
 * Wraps a route handler so an unhandled throw (a dropped Prisma connection,
 * malformed JSON in request.json(), a bug) logs the real error server-side
 * and still returns JSON, instead of falling through to Next's generic
 * unlabeled 500 HTML page.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
  routeLabel: string,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`[api:${routeLabel}]`, error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 },
      );
    }
  };
}

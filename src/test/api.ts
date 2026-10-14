/**
 * Builds a POST request with a JSON body for calling a route handler
 * directly in tests. Pass a string to send it as-is (e.g. invalid JSON).
 */
export function jsonRequest(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

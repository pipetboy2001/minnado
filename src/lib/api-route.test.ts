import { describe, expect, it, vi } from "vitest";
import { withErrorHandling } from "./api-route";

describe("withErrorHandling", () => {
  it("passes the handler's response through", async () => {
    const handler = withErrorHandling(
      async () => Response.json({ ok: true }, { status: 201 }),
      "test",
    );
    const response = await handler();
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("turns a thrown error into a JSON 500 and logs it with the route label", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const handler = withErrorHandling(async () => {
      throw new Error("boom");
    }, "test-route");

    const response = await handler();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Error interno del servidor",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "[api:test-route]",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});

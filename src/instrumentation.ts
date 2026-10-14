export async function register() {
  // Valida las variables de entorno al arrancar el servidor, para fallar
  // con un mensaje claro en vez de a mitad de una request.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}

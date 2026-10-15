import nodemailer from "nodemailer";
import { env, isSmtpConfigured } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!isSmtpConfigured) {
    throw new Error(
      "SMTP no está configurado: define SMTP_HOST, SMTP_USER y SMTP_PASS para enviar correos.",
    );
  }
  await transporter.sendMail({
    from: `"Minnado" <${env.SMTP_USER}>`,
    to,
    subject: "Restablece tu contraseña — Minnado",
    html: `
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Minnado.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a></p>
      <p>Este enlace vence en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `,
  });
}

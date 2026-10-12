import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"Minnado" <${process.env.SMTP_USER}>`,
    to,
    subject: "Restablece tu contraseña — Minnado",
    html: `
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Minnado.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a></p>
      <p>Este enlace vence en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `,
  });
}

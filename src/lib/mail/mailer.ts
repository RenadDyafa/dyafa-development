import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export type MailMessage = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
};

export interface MailTransport {
  send(message: MailMessage): Promise<void>;
}

class ConsoleTransport implements MailTransport {
  async send(message: MailMessage) {
    logger.info({ to: message.to, subject: message.subject }, "[console-mail] would send email");
    // eslint-disable-next-line no-console
    console.log(`\n--- MAIL (console transport) ---\nTo: ${message.to.join(", ")}\nSubject: ${message.subject}\n\n${message.text ?? message.html}\n--- END MAIL ---\n`);
  }
}

class SmtpTransport implements MailTransport {
  private transporterPromise: Promise<import("nodemailer").Transporter> | null = null;

  private async getTransporter() {
    if (!this.transporterPromise) {
      this.transporterPromise = import("nodemailer").then((nodemailer) =>
        nodemailer.default.createTransport({
          host: env.smtpHost,
          port: env.smtpPort,
          secure: env.smtpPort === 465,
          auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined,
        }),
      );
    }
    return this.transporterPromise;
  }

  async send(message: MailMessage) {
    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: env.mailFrom,
      to: message.to.join(", "),
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}

class ResendTransport implements MailTransport {
  async send(message: MailMessage) {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: env.mailFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}

function getTransport(): MailTransport {
  switch (env.mailProvider) {
    case "smtp":
      return new SmtpTransport();
    case "resend":
      return new ResendTransport();
    default:
      return new ConsoleTransport();
  }
}

export async function sendMail(message: MailMessage) {
  const transport = getTransport();
  await transport.send(message);
}

import nodemailer, { Transporter } from "nodemailer";

import Config from "../config";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailNotificationService, Message } from "../types/notification";

export class NodeMailerNotificationService implements MailNotificationService {
  private transporter: Transporter;

  constructor() {
    const transportOptions: SMTPTransport.Options = {
      host: Config.SMTP_HOST!,
      port: Number(Config.SMTP_PORT)!,
      secure: false,
      auth: {
        user: Config.MAIL_USER,
        pass: Config.MAIL_PASSWORD,
      },
    };
    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async send(message: Message): Promise<string | void> {
    try {
      const mailOptions = {
        from: '"YouthShield" <support@youthshield.com>',
        to: message.to,
        subject: message.subject || "No Subject",
        text: message.text,
        html: message.html || undefined,
        attachments: message.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.messageId);

      return info.messageId;
    } catch (error) {
      console.error("Failed to send email:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }
  }
}

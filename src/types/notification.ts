export interface Message {
  to: string;
  text?: string;
  html?: string;
  subject?: string;
  attachments?: [
    {
      filename: string;
      content: string;
    }
  ];
}

export interface MailNotificationService {
  send(message: Message): Promise<string | void>;
}

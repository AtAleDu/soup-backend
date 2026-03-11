import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const EMAIL_NOT_CONFIGURED =
  "Почта не настроена. Укажите NOTISEND_API_BASE_URL, NOTISEND_API_KEY и EMAIL_FROM в .env";

@Injectable()
export class EmailService {
  private readonly notisendApiBaseUrl: string | null;
  private readonly notisendApiKey: string | null;
  private readonly fromEmail: string | null;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    this.notisendApiBaseUrl =
      this.configService.get<string>("NOTISEND_API_BASE_URL") ?? null;
    this.notisendApiKey =
      this.configService.get<string>("NOTISEND_API_KEY") ?? null;
    this.fromEmail = this.configService.get<string>("EMAIL_FROM") ?? null;
    this.fromName = this.configService.get<string>("APP_NAME") ?? "Soup";
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const appName = this.configService.get<string>("APP_NAME", "Soup");
    const subject = `Код подтверждения - ${appName}`;
    const text = this.getVerificationText(code, appName);
    const html = this.toHtml(text);

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  async sendPasswordResetLink(email: string, link: string): Promise<void> {
    const appName = this.configService.get<string>("APP_NAME", "Soup");
    const subject = `Сброс пароля - ${appName}`;
    const text = this.getPasswordResetText(appName, link);
    const html = this.toHtml(text);

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<string> {
    if (!this.notisendApiBaseUrl || !this.notisendApiKey || !this.fromEmail) {
      throw new Error(EMAIL_NOT_CONFIGURED);
    }

    const baseUrl = this.notisendApiBaseUrl.replace(/\/+$/, "");
    const url = `${baseUrl}/email/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.notisendApiKey}`,
      },
      body: JSON.stringify({
        from_email: this.fromEmail,
        from_name: this.fromName,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    const responseText = await response.text();
    let data: any | null = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const details: string[] = [];

      if (data && Array.isArray(data.errors)) {
        for (const err of data.errors) {
          if (err && typeof err.detail === "string") {
            details.push(err.detail);
          }
        }
      }

      const detailsMessage = details.join("; ");
      const baseMessage = `Notisend error: ${response.status}`;
      throw new Error(
        detailsMessage ? `${baseMessage} - ${detailsMessage}` : baseMessage,
      );
    }

    const messageId =
      (data && (data.id as string | undefined)) ??
      (data && (data.message_id as string | undefined)) ??
      "";

    return messageId;
  }

  private getVerificationText(code: string, appName: string): string {
    return [
      `${appName}`,
      "",
      "Код подтверждения:",
      code,
      "",
      "Код действителен в течение 15 минут.",
      "Если вы не запрашивали этот код, просто проигнорируйте это письмо.",
    ].join("\n");
  }

  private getPasswordResetText(appName: string, link: string): string {
    return [
      `${appName}`,
      "",
      "Для сброса пароля перейдите по ссылке:",
      link,
      "",
      "Ссылка действует 15 минут.",
      "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
    ].join("\n");
  }

  private toHtml(text: string): string {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `<p>${escaped.replace(/\n/g, "<br/>")}</p>`;
  }
}
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

const EMAIL_NOT_CONFIGURED =
  "Почта не настроена. Укажите RESEND_API_KEY в .env";

@Injectable()
export class EmailService {
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Пока отключено: создание клиента Resend не выполняется
    // const apiKey = this.configService.get<string>("RESEND_API_KEY");
    // this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail =
      this.configService.get<string>("EMAIL_FROM") || "onboarding@resend.dev";
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (!this.resend) throw new Error(EMAIL_NOT_CONFIGURED);

    const appName = this.configService.get<string>("APP_NAME", "Soup");
    const subject = `Код подтверждения - ${appName}`;

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject,
      text: this.getVerificationText(code, appName),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }
  }

  async sendPasswordResetLink(email: string, link: string): Promise<void> {
    if (!this.resend) throw new Error(EMAIL_NOT_CONFIGURED);

    const appName = this.configService.get<string>("APP_NAME", "Soup");
    const subject = `Сброс пароля - ${appName}`;

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject,
      text: this.getPasswordResetText(appName, link),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }
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
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService:ConfigService) {
    this.transporter = nodemailer.createTransport({
        service: "gmail",
            auth: {
                user: this.configService.get<string>('mail.user'),
                
                pass: this.configService.get<string>('mail.pass'), 
            },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.user'),
      to,
      subject,
      text,
    });
  }
}

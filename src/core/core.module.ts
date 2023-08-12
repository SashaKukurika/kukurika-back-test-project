import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

import { Configs } from './configs/constants';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: `smtp://${Configs.BREVO_SMTP_LOGIN}:${Configs.BREVO_SMTP_PASSWORD}@${Configs.BREVO_SMTP_SERVER}:${Configs.BREVO_SMTP_PORT}`,
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: path.join(__dirname, '..', '..', '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class CoreModule {}

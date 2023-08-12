import * as path from 'node:path';

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as process from 'process';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: `smtp://${process.env.BREVO_SMTP_LOGIN}:${process.env.BREVO_SMTP_PASSWORD}@${process.env.BREVO_SMTP_SERVER}:${process.env.BREVO_SMTP_PORT}`,
      defaults: {
        from: '"avoria-clone" <avoriaclone@nestjs.com>',
      },
      template: {
        dir: path.join(__dirname, '/templates'),
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
export class MailModule {}

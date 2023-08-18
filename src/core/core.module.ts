import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

import { Car } from '../cars/entities/car.entity';
import { Counter } from '../cars/entities/counter.entity';
import { Configs } from './configs/constants';
import { CronService } from './cron/cron.service';
import { CurrencyService } from './currency/currency.service';
import { MailService } from './mail/mail.service';
import { ResponseService } from './mappers/mapper.service';
import { PasswordService } from './password/password.service';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car, Counter]),
    MailerModule.forRoot({
      transport: `smtp://${Configs.BREVO_SMTP_LOGIN}:${Configs.BREVO_SMTP_PASSWORD}@${Configs.BREVO_SMTP_SERVER}:${Configs.BREVO_SMTP_PORT}`,
      defaults: {
        from: '"avtoria-clone" <avtoria-clone@avto.com>',
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
  providers: [
    MailService,
    CurrencyService,
    CronService,
    ResponseService,
    S3Service,
    PasswordService,
  ],
  exports: [
    MailService,
    CurrencyService,
    CronService,
    ResponseService,
    S3Service,
    PasswordService,
  ],
})
export class CoreModule {}

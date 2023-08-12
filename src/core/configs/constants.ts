import { config } from 'dotenv';
import * as process from 'process';

config();

export const Configs = {
  BREVO_SMTP_SERVER: process.env.BREVO_SMTP_SERVER,
  BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
  BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN,
  BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD,
};

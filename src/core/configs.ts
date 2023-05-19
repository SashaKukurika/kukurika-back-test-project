import { config } from 'dotenv';
import * as process from 'process';

config();

export const Configs = {
  TELEGRAM_API: process.env.TELEGRAM_API,
  GPT_API: process.env.GPT_API,
};

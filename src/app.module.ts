import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatgptModule } from './chatgpt/chatgpt.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ChatgptModule,
    TelegramModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService extends Telegraf<Context> {
  @Start()
  onStart(@Ctx() ctx: Context) {
    ctx.replyWithHTML(`<b>Hi, ${ctx.from.username}</b>
It's chatGPT bot!
Enter question and get answer
`);
  }

  @On('text')
  onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    ctx.replyWithHTML(`<i>${message}</i>`);
  }
}

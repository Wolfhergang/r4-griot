import { createBot, Bot } from 'whatsapp-cloud-api';
import { Application } from 'express';

export type BotConfig = {
  WEBHOOK_VERIFICATION_TOKEN: string,
  PHONE_ID: string,
  TOKEN: string,
}

const initializeBot = async (config: BotConfig, app: Application) => {
  try {
    // replace the values below
    const webhookVerifyToken : string = config.WEBHOOK_VERIFICATION_TOKEN
    const from : string = config.PHONE_ID
    const token : string = config.TOKEN
    
    // Create a bot that can send messages
    const bot : Bot = createBot(from, token);

    // Start express server to listen for incoming messages
    // you can verify the webhook URL and make the server publicly available    
    const expressApp = await bot.startExpressServer({
      app,
      webhookVerifyToken,
    });

    // Listen to ALL incoming messages
    bot.on('message', async (msg) => {
      await bot.sendText(msg.from, 'Received your text message!');
    });
  } catch (err) {
    console.log(err);
  }

  return true
}

export default initializeBot
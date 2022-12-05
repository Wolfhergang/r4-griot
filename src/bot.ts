import { createBot, Bot } from 'whatsapp-cloud-api';
import { Application } from 'express';

export type BotConfig = {
  WEBHOOK_VERIFICATION_TOKEN: string,
  PHONE_ID: string,
  TOKEN: string,
}

let singletonBot: Bot | null = null

const initializeBot = async (config: BotConfig, app: Application) => {
  try {
    // replace the values below
    const webhookVerifyToken : string = config.WEBHOOK_VERIFICATION_TOKEN
    const from : string = config.PHONE_ID
    const token : string = config.TOKEN
    
    if(singletonBot) 
      return true

    // Create a bot that can send messages
    singletonBot = createBot(from, token);

    console.log('[server]: Bot created, token:', token.slice(0, 5)+'...')

    // Start express server to listen for incoming messages
    // you can verify the webhook URL and make the server publicly available    
    await singletonBot?.startExpressServer({
      app,
      webhookVerifyToken,
    });

    // Listen to ALL incoming messages
    singletonBot?.on('message', async (msg) => {
      console.log(`[server]: Message received from: ${msg.from}`, msg.data)

      await singletonBot?.sendText(msg.from, 'Received your text message!');
    });
  } catch (err) {
    console.log(err);
  }

  return true
}

export default initializeBot
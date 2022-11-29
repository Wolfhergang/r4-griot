import * as dotenv from 'dotenv'
dotenv.config()

import { createBot, Bot } from 'whatsapp-cloud-api';

(async () => {
  try {
    // replace the values below
    const webhookVerifyToken : string = process.env.WEBHOOK_VERIFICATION_TOKEN || '';
    const from : string = process.env.PHONE_ID || '';
    const token : string = process.env.TOKEN || '';
    
    // Create a bot that can send messages
    const bot : Bot = createBot(from, token);

    // Start express server to listen for incoming messages
    // you can verify the webhook URL and make the server publicly available    
    await bot.startExpressServer({
      webhookVerifyToken,
    });

    // Listen to ALL incoming messages
    bot.on('message', async (msg) => {
      console.log(msg);

      await bot.sendText(msg.from, 'Received your text message!');
    });
  } catch (err) {
    console.log(err);
  }
})();
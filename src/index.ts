import * as dotenv from 'dotenv'
dotenv.config()

import { createBot, Bot } from 'whatsapp-cloud-api';

(async () => {
  try {
    // replace the values below
    const webhookVerifyToken : string = process.env.WEBHOOK_VERIFICATION_TOKEN || '';
    const from : string = process.env.PHONE_ID || '';
    const token : string = process.env.TOKEN || '';
    const to : string = '526141388579';

    // Create a bot that can send messages
    const bot : Bot = createBot(from, token);

    // Send text message
    // const response = await bot.sendText(to, 'Hello world');

    // Start express server to listen for incoming messages
    // NOTE: See below under `Documentation/Tutorial` to learn how
    // you can verify the webhook URL and make the server publicly available
    
    await bot.startExpressServer({
      webhookVerifyToken,
    });

    // Listen to ALL incoming messages
    bot.on('message', async (msg) => {
      console.log(msg);

      if (msg.type === 'text') {
        await bot.sendText(msg.from, 'Received your text message!');
      } else if (msg.type === 'image') {
        await bot.sendText(msg.from, 'Received your image!');
      }
    });
  } catch (err) {
    console.log(err);
  }
})();
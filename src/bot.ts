import { Request, Response } from 'express';

const GRAPH_API_BASE_URL = 'https://graph.facebook.com/v15.0';

const sendMessage = async (config: BotConfig, message: string) => {
  const response = await fetch(`${GRAPH_API_BASE_URL}/${config.PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.TOKEN}`
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "PHONE_NUMBER",
      "type": "text",
      "text": { 
        "preview_url": false,
        "body": message
      }
    }),
  })

  return true
}

export type BotConfig = {
  WEBHOOK_VERIFICATION_TOKEN: string,
  PHONE_ID: string,
  TOKEN: string,
}

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  INTERACTIVE = 'interactive'
}

type MessageEntry = {
  changes: Array<{
    value: {
      messages: Array<{
        from: string,
        id: string,
        timestamp: string,
        type: MessageType,
        [key: string]: any
      }>,
    }
  }>,
}

const handleReceivingMessage = async (req: Request, res: Response, config: BotConfig) => {
  try {
    const messageEntry = req.body as MessageEntry;
    
    const {
      from,
      type,
      ...rest
    } = messageEntry.changes[0].value.messages[0];
  
    if(type !== MessageType.TEXT) {
      // Not supporting other types of messages... yet
      return res.sendStatus(501);
    }
  
    // TODO: handle message.... somehow
    const message = rest.text.body;
    await sendMessage(config, `This was your message: ${message}`)
  
    res.sendStatus(200);
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

const isTokenValid = (token: string, requiredToken: string) => token === requiredToken;

const handleWebhookVerification = (req: Request, res: Response, config: BotConfig) => {
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;
  const comunicationMode = req.query['hub.mode'] as string;

  if (
    comunicationMode == 'subscribe' &&
    isTokenValid(token, config.WEBHOOK_VERIFICATION_TOKEN)
  ) {
    console.log('webhook verified successfully!')
    res.setHeader('content-type', 'text/plain');
    res.send(challenge);
  } else {
    console.log('webhook verification failed =(!')
    res.sendStatus(403);
  }
}

const botHandlerFactory = (config: BotConfig) => {
  const botHandler = async (req: Request, res: Response) => {
    if(req.method === 'GET') {
      return handleWebhookVerification(req, res, config)
    }
    
    if(req.method === 'POST') {
      return handleReceivingMessage(req, res, config)
    }
  }

  return botHandler
}

export default botHandlerFactory
import { Request, Response } from 'express';
import axios from 'axios';
import actionsHandler from './actions';

const GRAPH_API_BASE_URL = 'https://graph.facebook.com/v15.0';

export const sendMessage = async (config: BotConfig, message: string, to: string) => {
  return axios.post(`${GRAPH_API_BASE_URL}/${config.PHONE_ID}/messages`,
    {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      to,
      "type": "text",
      "text": {
        "preview_url": false,
        "body": message
      }
    }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.TOKEN}`
    }
  }
  )
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

type WhatsappMessageBody = {
  object: 'whatsapp_business_account',
  entry: Array<{
    id: string,
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
  }>
}

const handleReceivingMessage = async (req: Request, res: Response, config: BotConfig) => {
  try {
    const messageEntry = req.body as WhatsappMessageBody;

    const {
      from,
      type,
      ...rest
    } = messageEntry.entry[0].changes[0].value.messages[0];

    if (type !== MessageType.TEXT) {
      // Not supporting other types of messages... yet
      return res.sendStatus(501);
    }

    const message = rest.text.body;

    console.log('Received message:', message)

    const responses = await actionsHandler(message);
    
    for (const response of responses) {
      await sendMessage(config, response, `${from.slice(0, 2)}${from.slice(3)}`);
    }
    
    res.sendStatus(200);
  } catch (error: any) {
    console.log('Error:', error)
    console.error(error.message)
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
    console.log('Request method:', req.method)
    console.log('Received request:', req.body)
    console.log('Received query:', req.query)

    if (req.method === 'GET') {
      return handleWebhookVerification(req, res, config)
    }

    if (req.method === 'POST') {
      return handleReceivingMessage(req, res, config)
    }
  }

  return botHandler
}

export default botHandlerFactory
import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

const GRAPH_API_BASE_URL = 'https://graph.facebook.com/v15.0';

const sendMessage = async (config: BotConfig, message: string, to: string) => {
  const axiosRequestData: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.TOKEN}`
    },
    data: {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      to,
      "type": "text",
      "text": { 
        "preview_url": false,
        "body": message
      }
    }
  }

  return axios.post(`${GRAPH_API_BASE_URL}/${config.PHONE_ID}/messages`, axiosRequestData)
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
  
    if(type !== MessageType.TEXT) {
      // Not supporting other types of messages... yet
      return res.sendStatus(501);
    }
  
    const message = rest.text.body;
    
    console.log('Received message:', message)
    console.log('From:', from)
    
    // TODO: handle message.... somehow
    await sendMessage(config, `This was your message: ${message}`, from)
  
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
    console.log('Request method:', req.method)
    console.log('Received request:', req.body)
    console.log('Received query:', req.query)

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
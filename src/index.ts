import * as dotenv from 'dotenv'
dotenv.config()
import botHandlerFactory, { BotConfig } from './bot'
import express from 'express'
import serverlessExpress from '@vendia/serverless-express'

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json());

const config: BotConfig = {
  WEBHOOK_VERIFICATION_TOKEN: process.env.WEBHOOK_VERIFICATION_TOKEN || "",
  PHONE_ID: process.env.PHONE_ID || "",
  TOKEN: process.env.TOKEN || "",
}

app.get('/', (req, res) => {
  res.send('health check: ok')
})

app.all('/bot', botHandlerFactory(config))

app.listen(PORT, () => { console.log(`[server]: Server is running at port:${PORT}`) })

export const handler = serverlessExpress({ app })

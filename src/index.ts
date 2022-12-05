import * as dotenv from 'dotenv'
dotenv.config()
import initializeBot, { BotConfig } from './bot'
import express from 'express'
import serverlessExpress from '@vendia/serverless-express'

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json());
app.use((req, _, next) => {
  console.log("Request received")
  console.log('METHOD', req.method)
  console.log('URL', req.url)
  console.log('body', req.body)
  next()
})

const config: BotConfig = {
  WEBHOOK_VERIFICATION_TOKEN: process.env.WEBHOOK_VERIFICATION_TOKEN || "",
  PHONE_ID: process.env.PHONE_ID || "",
  TOKEN: process.env.TOKEN || "",
}

initializeBot(config, app).then(() => {
  console.log('[server]: Bot initialized')
})

app.get('/', (req, res) => {
  res.send('health check: ok')
})

app.listen(PORT, () => { console.log(`[server]: Server is running at port:${PORT}`) })

export const handler = serverlessExpress({ app })

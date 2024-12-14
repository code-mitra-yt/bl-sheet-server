import { config } from 'dotenv'
config()

const { PORT, DB_URL, NODE_ENV, ACCESS_TOKEN_SECRET } = process.env

const ENV = {
  PORT,
  DB_URL,
  NODE_ENV,
  ACCESS_TOKEN_SECRET,
}

export default ENV

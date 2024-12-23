import { config } from 'dotenv'
config()

const { PORT, DB_URL, NODE_ENV, ACCESS_TOKEN_SECRET, FRONTEND_URL } =
  process.env

const ENV = {
  PORT,
  DB_URL,
  NODE_ENV,
  ACCESS_TOKEN_SECRET,
  FRONTEND_URL,
}

export default ENV

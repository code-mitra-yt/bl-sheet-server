import { config } from 'dotenv'
config()

const {
  PORT,
  DB_URL,
  NODE_ENV,
  ACCESS_TOKEN_SECRET,
  FRONTEND_URL,
  MAIL_PORT,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_FROM,
  MAIL_USERNAME,
} = process.env

const ENV = {
  PORT,
  DB_URL,
  NODE_ENV,
  ACCESS_TOKEN_SECRET,
  FRONTEND_URL,
  MAIL_PORT,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_FROM,
  MAIL_USERNAME,
}

export default ENV

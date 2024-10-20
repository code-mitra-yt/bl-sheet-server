import { config } from 'dotenv'
config()

const { PORT, DB_URL } = process.env

const ENV = {
  PORT,
  DB_URL,
}

export default ENV

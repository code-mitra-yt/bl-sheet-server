import { config } from 'dotenv'
config()

const { PORT } = process.env

const ENV = {
  PORT,
}

export default ENV

import mongoose from 'mongoose'
import { ENV } from './index'

const connectDB = async () => {
  const DB_URL = ENV.DB_URL
  if (!DB_URL) throw Error('DB URL NOT FOUND!')
  await mongoose.connect(DB_URL)
}

export default connectDB

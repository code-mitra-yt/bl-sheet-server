import nodemailer, { TransportOptions } from 'nodemailer'

import { ENV } from '../../config'
import { NotificationMessage } from '../../types/shared/shared.types'

class NotificationService {
  private transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.MAIL_HOST,
      port: ENV.MAIL_PORT,
      secure: false,
      auth: {
        user: ENV.MAIL_USERNAME,
        pass: ENV.MAIL_PASSWORD,
      },
    } as TransportOptions)
  }

  async send(message: NotificationMessage) {
    await this.transporter.sendMail({
      from: message?.from
        ? `${message.from} <${ENV.MAIL_USERNAME}>`
        : ENV.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
  }
}

export default NotificationService

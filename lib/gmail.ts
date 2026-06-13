import nodemailer from "nodemailer"

interface GmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: GmailAttachment[]
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmailWithGmail({ to, subject, html, attachments }: SendEmailParams) {
  const info = await transporter.sendMail({
    from: `"Sistema de Secuencias" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  })

  return { id: info.messageId }
}

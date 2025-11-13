import * as crypto from 'crypto'

export function decodeSession(cookie: string): any {
  try {
    const sessionSecret = process.env.SESSION_SECRET
    const cookieParts = cookie.split('.')

    if (cookieParts.length < 2) {
      return null
    }

    const payload = cookieParts[0]
    const signature = cookieParts[1]

    const expectedSignature = crypto
      .createHmac('sha256', sessionSecret)
      .update(payload)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    if (signature !== expectedSignature) {
      return null
    }

    const decodedPayload = Buffer.from(payload, 'base64').toString('utf8')
    const sessionData = JSON.parse(decodedPayload)

    return sessionData
  } catch {
    return null
  }
}

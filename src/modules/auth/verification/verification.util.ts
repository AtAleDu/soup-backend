import * as crypto from 'crypto'

// криптостойкая генерация 4-значного кода
export function generateVerificationCode(): string {
  const n = crypto.randomInt(0, 10000)
  return n.toString().padStart(4, '0')
}

// хэшируем код, сам код в БД не храним
export function hashVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

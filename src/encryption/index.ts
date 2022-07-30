import crypto from 'crypto';

const KEY = process.env.ENCRYPTION_KEY;
const IV = '5183666c72eec9e4';

export default function encrypt(data: string): string {
  if (!KEY) throw new Error('Encryption key not found!');

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), IV);
  const encrypted = cipher.update(data, 'utf8', 'base64');

  return encrypted + cipher.final('base64');
}

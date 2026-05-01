export function encrypt(val: string): string {
  return Buffer.from(val).toString('base64');
}

export function decrypt(val: string): string {
  return Buffer.from(val, 'base64').toString('utf-8');
}

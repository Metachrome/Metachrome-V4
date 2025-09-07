import type { VercelRequest, VercelResponse } from '@vercel/node';
import tradesHandler from '../trades';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Proxy to the consolidated trades handler
  return tradesHandler(req, res);
}

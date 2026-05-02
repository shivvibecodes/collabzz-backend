import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact';
import { createContactSchema } from '../utils/validation';

// Simple in-memory cache for rate limiting
const contactCache = new Map<string, number>();

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const cacheKey = `contact_limit_${ipAddress}`;

    const lastRequest = contactCache.get(cacheKey);
    const now = Date.now();

    if (lastRequest && now - lastRequest < 60000) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Please wait a minute before sending another message.',
      });
    }

    const parsedData = createContactSchema.parse(req.body);
    const result = new Contact({ ...parsedData, ipAddress });
    await result.save();

    contactCache.set(cacheKey, now);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

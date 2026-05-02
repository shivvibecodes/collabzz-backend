import { Request, Response, NextFunction } from 'express';
import { Waitlist } from '../models/Waitlist';
import { submitWaitlistSchema } from '../utils/validation';

export const submitWaitlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedData = submitWaitlistSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const existing = await Waitlist.findOne({ email: parsedData.email });
    if (existing) {
      return res.status(409).json({
        statusCode: 409,
        message: 'This email is already on the waitlist.',
      });
    }

    const entry = new Waitlist({ ...parsedData, ipAddress });
    await entry.save();

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

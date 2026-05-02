import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const liveness = (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is working' });
};

export const readiness = (req: Request, res: Response) => {
  try {
    const isConnected = String(mongoose.connection.readyState) === '1';
    if (!isConnected) {
      return res.status(503).json({
        status: 'error',
        details: { mongodb: { status: 'down' } },
      });
    }
    res.json({
      status: 'ok',
      info: { mongodb: { status: 'up' } },
      error: {},
      details: { mongodb: { status: 'up' } },
    });
  } catch (_error) {
    res.status(503).json({
      status: 'error',
      details: { mongodb: { status: 'down' } },
    });
  }
};

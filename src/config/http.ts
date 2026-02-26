import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Express } from 'express';
import express from 'express';
import helmet from 'helmet';

export class HttpConfig {
  private static instance: HttpConfig;

  private constructor() { }

  static getInstance(): HttpConfig {
    if (!HttpConfig.instance) {
      HttpConfig.instance = new HttpConfig();
    }
    return HttpConfig.instance;
  }

  configure(app: Express): void {
    const corsOptions = {
      origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean | string) => void) => {
        callback(null, origin ?? '*');
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    app.use(express.json());
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(cookieParser());
  }
}
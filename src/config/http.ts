import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import { EnvConfig } from './env';

export class HttpConfig {
  private static instance: HttpConfig;

  private constructor() {}

  static getInstance(): HttpConfig {
    if (!HttpConfig.instance) {
      HttpConfig.instance = new HttpConfig();
    }
    return HttpConfig.instance;
  }

  configure(app: Express): void {
    const env = EnvConfig.get();

    app.use(helmet());
    app.use(
      cors({
        origin: env.corsOrigin ?? true
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
  }
}
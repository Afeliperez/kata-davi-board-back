const jsonMiddleware = jest.fn();
const helmetMiddleware = jest.fn();
const corsMiddleware = jest.fn();
const cookieMiddleware = jest.fn();

const jsonMock = jest.fn(() => jsonMiddleware);
const helmetMock = jest.fn(() => helmetMiddleware);
const corsMock = jest.fn(() => corsMiddleware);
const cookieParserMock = jest.fn(() => cookieMiddleware);

jest.mock('express', () => ({
  __esModule: true,
  default: {
    json: jsonMock
  }
}));

jest.mock('helmet', () => ({
  __esModule: true,
  default: helmetMock
}));

jest.mock('cors', () => ({
  __esModule: true,
  default: corsMock
}));

jest.mock('cookie-parser', () => ({
  __esModule: true,
  default: cookieParserMock
}));

import { HttpConfig } from '@config/http';

describe('HttpConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns singleton instance', () => {
    const first = HttpConfig.getInstance();
    const second = HttpConfig.getInstance();

    expect(first).toBe(second);
  });

  it('configures express middlewares and CORS options', () => {
    const app = { use: jest.fn() } as never;

    HttpConfig.getInstance().configure(app);

    expect(jsonMock).toHaveBeenCalledTimes(1);
    expect(helmetMock).toHaveBeenCalledTimes(1);
    expect(corsMock).toHaveBeenCalledTimes(1);
    expect(cookieParserMock).toHaveBeenCalledTimes(1);

    expect((app as { use: jest.Mock }).use).toHaveBeenNthCalledWith(1, jsonMiddleware);
    expect((app as { use: jest.Mock }).use).toHaveBeenNthCalledWith(2, helmetMiddleware);
    expect((app as { use: jest.Mock }).use).toHaveBeenNthCalledWith(3, corsMiddleware);
    expect((app as { use: jest.Mock }).use).toHaveBeenNthCalledWith(4, cookieMiddleware);

    const corsOptions = (corsMock as jest.Mock).mock.calls[0]?.[0] as {
      origin: (origin: string | undefined, callback: jest.Mock) => void;
      methods: string[];
      allowedHeaders: string[];
    };
    const callback = jest.fn();
    corsOptions.origin(undefined, callback);

    expect(corsOptions.methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    expect(corsOptions.allowedHeaders).toEqual(['Content-Type', 'Authorization']);
    expect(callback).toHaveBeenCalledWith(null, '*');
  });
});

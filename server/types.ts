import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      username?: string;
      email?: string;
      role: string;
      walletAddress?: string;
    };
  }
}

export {};

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    res.status(401).json({ error: "Missing auth token" });
    return;
  }
  try {
    const payload = verifyToken(m[1]);
    req.userId = payload.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

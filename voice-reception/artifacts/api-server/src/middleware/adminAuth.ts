import { type Request, type Response, type NextFunction } from "express";
import { isAdminAuthorization } from "../security/secrets";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    res.status(500).json({ error: "ADMIN_API_KEY not configured on server" });
    return;
  }

  if (!isAdminAuthorization(req.headers.authorization)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

import { Router } from "express";
import { secretsEqual } from "../security/secrets";
import { limitLogin } from "../security/conversations";

const router = Router();

router.post("/", limitLogin, (req, res) => {
  const password: unknown = req.body?.password;
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    res.status(500).json({ error: "ADMIN_API_KEY not configured on server" });
    return;
  }

  if (!secretsEqual(password, adminKey)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ ok: true });
});

export default router;

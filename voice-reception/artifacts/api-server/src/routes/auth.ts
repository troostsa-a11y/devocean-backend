import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    res.status(500).json({ error: "ADMIN_API_KEY not configured on server" });
    return;
  }

  if (!password || password !== adminKey) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ ok: true });
});

export default router;

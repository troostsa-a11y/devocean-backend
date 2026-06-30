import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, bookings } from "@workspace/db";
import { gte, count } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalConvResult] = await db
    .select({ value: count() })
    .from(conversations);

  const [totalBookResult] = await db
    .select({ value: count() })
    .from(bookings);

  const [weekConvResult] = await db
    .select({ value: count() })
    .from(conversations)
    .where(gte(conversations.createdAt, oneWeekAgo));

  const [weekBookResult] = await db
    .select({ value: count() })
    .from(bookings)
    .where(gte(bookings.createdAt, oneWeekAgo));

  res.json({
    totalConversations: Number(totalConvResult?.value ?? 0),
    totalBookings: Number(totalBookResult?.value ?? 0),
    conversationsThisWeek: Number(weekConvResult?.value ?? 0),
    bookingsThisWeek: Number(weekBookResult?.value ?? 0),
  });
});

export default router;

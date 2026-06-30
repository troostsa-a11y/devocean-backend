import { Router } from "express";
import { db, withDbRetry } from "@workspace/db";
import { bookings } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  GetBookingParams,
  DeleteBookingParams,
  CreateBookingBody,
} from "@workspace/api-zod";

const router = Router();

// List all bookings
router.get("/", async (_req, res) => {
  const all = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt));
  res.json(all);
});

// Create booking
router.post("/", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [created] = await withDbRetry(() =>
    db.insert(bookings).values(parsed.data).returning(),
  );
  res.status(201).json(created);
});

// Get booking
router.get("/:id", async (req, res) => {
  const parsed = GetBookingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, parsed.data.id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
});

// Delete booking
router.delete("/:id", async (req, res) => {
  const parsed = DeleteBookingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(bookings)
    .where(eq(bookings.id, parsed.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.status(204).end();
});

export default router;

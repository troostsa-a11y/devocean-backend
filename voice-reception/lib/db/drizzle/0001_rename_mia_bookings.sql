DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'mia_bookings'
  ) THEN
    ALTER TABLE "mia_bookings" RENAME TO "bookings";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" RENAME CONSTRAINT "mia_bookings_conversation_id_conversations_id_fk" TO "bookings_conversation_id_conversations_id_fk";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "reception_abuse_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reception_abuse_buckets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reception_work_leases" (
	"lease_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "reception_work_leases_lease_id_scope_pk" PRIMARY KEY("lease_id","scope")
);
--> statement-breakpoint
ALTER TABLE "reception_work_leases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "access_token_hash" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reception_abuse_buckets_expiry_idx" ON "reception_abuse_buckets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reception_work_leases_scope_expiry_idx" ON "reception_work_leases" USING btree ("scope","expires_at");--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'conversations'::regclass
      AND conname = 'conversations_public_id_unique'
  ) THEN
    ALTER TABLE "conversations" ADD CONSTRAINT "conversations_public_id_unique" UNIQUE("public_id");
  END IF;
END $$;
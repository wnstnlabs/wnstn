ALTER TABLE "site" ADD COLUMN "verification_record" text;--> statement-breakpoint
ALTER TABLE "site" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site" ADD COLUMN "verified_at" timestamp;
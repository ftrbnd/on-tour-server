ALTER TABLE "sessions" ADD COLUMN "access_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "refresh_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "refresh_token";
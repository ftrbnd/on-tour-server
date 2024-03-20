ALTER TABLE "users" ALTER COLUMN "spotify_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text NOT NULL;
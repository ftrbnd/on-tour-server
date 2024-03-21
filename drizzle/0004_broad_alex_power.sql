CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"access_token_expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_spotify_id_unique";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "refresh_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "spotify_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

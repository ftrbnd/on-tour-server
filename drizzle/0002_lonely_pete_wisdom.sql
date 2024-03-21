ALTER TABLE "users" ALTER COLUMN "avatar" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "refresh_token" text NOT NULL;
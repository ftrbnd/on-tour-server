CREATE TABLE IF NOT EXISTS "upcoming_shows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"artist" text NOT NULL,
	"tour" text NOT NULL,
	"venue" text NOT NULL,
	"city" text NOT NULL,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upcoming_shows" ADD CONSTRAINT "upcoming_shows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

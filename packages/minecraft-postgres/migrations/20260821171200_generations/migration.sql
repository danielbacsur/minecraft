CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TABLE "app"."generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"texture_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "generations_user_id_created_at_index" ON "app"."generations" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "app"."generations" ADD CONSTRAINT "generations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
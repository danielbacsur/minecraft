CREATE SCHEMA "stripe";
--> statement-breakpoint
CREATE TABLE "stripe"."subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"plan" text NOT NULL,
	"customer_id" text NOT NULL,
	"subscription_id" text NOT NULL UNIQUE,
	"status" text NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_customer_id_key" UNIQUE("customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_index" ON "stripe"."subscriptions" ("user_id");--> statement-breakpoint
ALTER TABLE "stripe"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "auth"."accounts" ADD COLUMN "issuer" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_account_id_index" ON "auth"."accounts" ("issuer","account_id");
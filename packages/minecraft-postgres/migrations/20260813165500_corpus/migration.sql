CREATE SCHEMA "corpus";
--> statement-breakpoint
CREATE TABLE "corpus"."skins" (
	"id" uuid PRIMARY KEY,
	"identity" jsonb NOT NULL,
	"identity_text" text NOT NULL,
	"identity_text_search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(identity_text, ''))) STORED NOT NULL,
	"identity_names" text NOT NULL,
	"identity_names_search" tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(identity_names, ''))) STORED NOT NULL,
	"identity_keywords" text NOT NULL,
	"identity_keywords_search" tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(identity_keywords, ''))) STORED NOT NULL,
	"identity_embedding" vector(1024),
	"appearance" jsonb NOT NULL,
	"appearance_text" text NOT NULL,
	"appearance_text_search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(appearance_text, ''))) STORED NOT NULL,
	"appearance_keywords" text NOT NULL,
	"appearance_keywords_search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(appearance_keywords, ''))) STORED NOT NULL,
	"appearance_attributes" text NOT NULL,
	"appearance_attributes_search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(appearance_attributes, ''))) STORED NOT NULL,
	"appearance_embedding" vector(1024),
	"multimodal_embedding" vector(1024)
);
--> statement-breakpoint
CREATE INDEX "skins_identity_names_trgm_index" ON "corpus"."skins" USING gin (regexp_replace(lower(immutable_unaccent(identity_names)), '[^a-z0-9, ]', '', 'g') gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "skins_identity_text_search_index" ON "corpus"."skins" USING gin ("identity_text_search");--> statement-breakpoint
CREATE INDEX "skins_identity_names_search_index" ON "corpus"."skins" USING gin ("identity_names_search");--> statement-breakpoint
CREATE INDEX "skins_identity_keywords_search_index" ON "corpus"."skins" USING gin ("identity_keywords_search");--> statement-breakpoint
CREATE INDEX "skins_appearance_text_search_index" ON "corpus"."skins" USING gin ("appearance_text_search");--> statement-breakpoint
CREATE INDEX "skins_appearance_keywords_search_index" ON "corpus"."skins" USING gin ("appearance_keywords_search");--> statement-breakpoint
CREATE INDEX "skins_appearance_attributes_search_index" ON "corpus"."skins" USING gin ("appearance_attributes_search");
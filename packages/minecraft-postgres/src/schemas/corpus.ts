import { sql } from "drizzle-orm";
import {
  snakeCase,
  customType,
  index,
  jsonb,
  text,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const corpus = snakeCase.schema("corpus");

const tsvector = customType<{ data: string; driverData: string }>({
  dataType: () => "tsvector",
});

// prettier-ignore
export const skins = corpus.table("skins", {
  id: uuid().primaryKey(),

  identity: jsonb().$type<{
    aliases: string[];
    franchise: string | null;
    keywords: string[];
    name: string | null;
  }>().notNull(),

  identityText: text().notNull(),
  identityTextSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('english', coalesce(identity_text, ''))`).notNull(),

  identityNames: text().notNull(),
  identityNamesSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('simple', coalesce(identity_names, ''))`).notNull(),
  identityNamesNormalised: text().generatedAlwaysAs(sql`regexp_replace(lower(immutable_unaccent(identity_names)), '[^a-z0-9, ]', '', 'g')`).notNull(),

  identityKeywords: text().notNull(),
  identityKeywordsSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('simple', coalesce(identity_keywords, ''))`).notNull(),

  identityEmbedding: vector({ dimensions: 1024 }),

  appearance: jsonb().$type<{
    accessories: string[];
    archetypes: string[];
    bottom: string[];
    colors: { item: string; name: string; role: string }[];
    face: string[];
    footwear: string[];
    hair: string[];
    head: string[];
    keywords: string[];
    motifs: string[];
    subjects: string[];
    themes: string[];
    top: string[];
    vibes: string[];
  }>().notNull(),

  appearanceText: text().notNull(),
  appearanceTextSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('english', coalesce(appearance_text, ''))`).notNull(),

  appearanceKeywords: text().notNull(),
  appearanceKeywordsSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('english', coalesce(appearance_keywords, ''))`).notNull(),

  appearanceAttributes: text().notNull(),
  appearanceAttributesSearch: tsvector().generatedAlwaysAs(sql`to_tsvector('english', coalesce(appearance_attributes, ''))`).notNull(),

  appearanceEmbedding: vector({ dimensions: 1024 }),

  multimodalEmbedding: vector({ dimensions: 1024 }),
}, (table) => [
  index().using("gin", table.identityTextSearch),
  index().using("gin", table.identityNamesSearch),
  index().using("gin", table.identityNamesNormalised.op("gin_trgm_ops")),
  index().using("gin", table.identityKeywordsSearch),
  index().using("gin", table.appearanceTextSearch),
  index().using("gin", table.appearanceKeywordsSearch),
  index().using("gin", table.appearanceAttributesSearch),
]);

import { postgres, schema, sql } from "@minecraft/postgres";

import { embedMultimodalQuery, embedQuery, rerank } from "./voyage";

type Candidate = {
  id: string;
  document: string;
};

export type SearchResult = {
  id: string;
};

export type SearchOptions = {
  limit?: number;
};

async function recall(text: string): Promise<Candidate[]> {
  const [embedding, multimodalEmbedding] = await Promise.all([
    embedQuery(text).then((values) => `[${values.join(",")}]`),
    embedMultimodalQuery(text).then((values) => `[${values.join(",")}]`),
  ]);

  const { rows } = await postgres.execute(sql`
    WITH
      identity AS (
        SELECT id, row_number() OVER (ORDER BY distance, id) AS rank
        FROM (
          SELECT skins.id, skins.identity_embedding <=> ${embedding}::vector(1024) AS distance
          FROM ${schema.skins}
          WHERE skins.identity_embedding IS NOT NULL
          ORDER BY distance, skins.id
          LIMIT 100
        )
      ),

      appearance AS (
        SELECT id, row_number() OVER (ORDER BY distance, id) AS rank
        FROM (
          SELECT skins.id, skins.appearance_embedding <=> ${embedding}::vector(1024) AS distance
          FROM ${schema.skins}
          WHERE skins.appearance_embedding IS NOT NULL
          ORDER BY distance, skins.id
          LIMIT 100
        )
      ),

      multimodal AS (
        SELECT id, row_number() OVER (ORDER BY distance, id) AS rank
        FROM (
          SELECT skins.id, skins.multimodal_embedding <=> ${multimodalEmbedding}::vector(1024) AS distance
          FROM ${schema.skins}
          WHERE skins.multimodal_embedding IS NOT NULL
          ORDER BY distance, skins.id
          LIMIT 100
        )
      ),

      _simple AS (
        SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS _simple
        FROM unnest(to_tsvector('simple', ${text}))
      ),

      _english AS (
        SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS _english
        FROM unnest(to_tsvector('english', ${text}))
      ),

      lexical AS (
        SELECT id, row_number() OVER (ORDER BY score DESC, id) AS rank
        FROM (
          SELECT skins.id, (
            1.00 * ts_rank_cd(skins.identity_names_search, _simple) +
            0.40 * ts_rank_cd(skins.appearance_keywords_search, _english) +
            0.30 * ts_rank_cd(skins.identity_keywords_search, _simple) +
            0.20 * ts_rank_cd(skins.appearance_attributes_search, _english) +
            0.15 * ts_rank_cd(skins.identity_text_search, _english) +
            0.10 * ts_rank_cd(skins.appearance_text_search, _english)
          ) AS score
          FROM ${schema.skins}, _english, _simple
          WHERE
            skins.identity_names_search @@ _simple OR
            skins.appearance_keywords_search @@ _english OR
            skins.identity_keywords_search @@ _simple OR
            skins.appearance_attributes_search @@ _english OR
            skins.identity_text_search @@ _english OR
            skins.appearance_text_search @@ _english
          ORDER BY score DESC, skins.id
          LIMIT 25
        )
      ),

      _normalized AS (
        SELECT regexp_replace(lower(immutable_unaccent(${text})), '[^a-z0-9 ]', '', 'g') AS _normalized
      ),

      fuzzy AS (
        SELECT id, row_number() OVER (ORDER BY score DESC, id) AS rank
        FROM (
          SELECT skins.id, (
            SELECT max(strict_word_similarity(_normalized, name))
            FROM unnest(string_to_array(skins.identity_names_normalised, ',')) AS name
          ) AS score
          FROM ${schema.skins}, _normalized
          WHERE _normalized <<% skins.identity_names_normalised
          ORDER BY score DESC, skins.id
          LIMIT 25
        )
      )

    SELECT
      skins.id,
      skins.identity_text,
      skins.appearance_text,
      skins.identity_keywords,
      skins.appearance_keywords,
      skins.appearance_attributes,
      sum(weight / (5 + rank)) AS score
    FROM (
      SELECT id, rank, 1.00 AS weight FROM identity UNION ALL
      SELECT id, rank, 1.00 AS weight FROM appearance UNION ALL
      SELECT id, rank, 1.00 AS weight FROM multimodal UNION ALL
      SELECT id, rank, 1.00 AS weight FROM lexical UNION ALL
      SELECT id, rank, 1.00 AS weight FROM fuzzy
    )
    JOIN ${schema.skins} USING (id)
    GROUP BY
      skins.id,
      skins.identity_text,
      skins.appearance_text,
      skins.identity_keywords,
      skins.appearance_keywords,
      skins.appearance_attributes
    ORDER BY score DESC, skins.id
    LIMIT 50
  `);

  return rows.map((row) => ({
    id: row.id as string,
    document: [
      row.identity_text as string,
      row.appearance_text as string,
      row.identity_keywords as string,
      row.appearance_keywords as string,
      row.appearance_attributes as string,
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

export async function search(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const { limit = 1 } = options;

  const trimmed = query.trim();
  if (!trimmed) return [];

  const candidates = await recall(trimmed);
  if (candidates.length === 0) return [];

  const documents = candidates.map((candidate) => candidate.document);
  const scores = await rerank(trimmed, documents);

  return scores.slice(0, limit).map(({ index }) => ({
    id: candidates[index].id,
  }));
}

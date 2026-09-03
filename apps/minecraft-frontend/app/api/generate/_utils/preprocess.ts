import { generateText, Output } from "ai";
import { z } from "zod";

import { Cache } from "@minecraft/cache";

const INSTRUCTIONS = `You turn a child's request for a Minecraft skin into a search query over a catalogue of skins.

Every skin in the catalogue has an English caption with two parts. Identity: the character's name, aliases and franchise. Appearance: hair, head, face, top, bottom, footwear, accessories, motifs, colors written as "<color> <item>", plus archetypes, themes, subjects and vibes.

The request was machine-translated into English and may carry translation slips, misspellings, slang or leftover words from another language. Work out what the child meant.

Names are only for things asked for by name: characters, creatures, people, games, shows, brands. Spell each the canonical way. Minecraft itself is never a name; its mobs and characters are. Never turn a description into a person's name, and never guess a real person from a description.

Appearance is always filled in. For a named character describe the outfit that character is best known for. For a description, keep every detail the child gave and complete the outfit plausibly. Use simple color words and simple garment words.`;

const Preprocessed = z.object({
  english: z
    .string()
    .describe("The request rewritten as one clear English sentence."),

  names: z
    .array(z.string())
    .describe(
      "Canonical names of the characters, creatures, people, games, shows or brands the child asked for by name. Empty when the request is only a description.",
    ),

  appearance: z
    .string()
    .describe(
      "One or two sentences in catalogue caption style: colors with items, hair, headwear, face, top, bottom, footwear, accessories, motifs, archetype, vibe.",
    ),

  keywords: z
    .array(z.string())
    .describe(
      'Three to ten lowercase catalogue tags: archetypes, themes, subjects and "<color> <item>" pairs.',
    ),
});

export type Preprocessed = z.infer<typeof Preprocessed>;

const cache = new Cache<Preprocessed>("preprocess");

export async function preprocess(english: string) {
  const cached = await cache.get(english);
  if (cached !== undefined) return cached;

  const { output } = await generateText({
    model: "openai/gpt-5.6-luna",
    instructions: INSTRUCTIONS,
    prompt: english,
    output: Output.object({ schema: Preprocessed }),
    temperature: 0,
    maxOutputTokens: 512,
    providerOptions: { openai: { serviceTier: "priority" } },
  });

  cache.set(english, output);
  return output;
}

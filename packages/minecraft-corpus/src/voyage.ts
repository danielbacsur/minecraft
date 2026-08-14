import { VoyageAIClient } from "voyageai";

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY as string,
});

export async function embedQuery(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: [text],
    model: "voyage-4-large",
    inputType: "query",
    outputDimension: 1024,
  });

  return response.data![0].embedding!;
}

export async function embedMultimodalQuery(text: string): Promise<number[]> {
  const response = await voyage.multimodalEmbed({
    inputs: [{ content: [{ type: "text", text }] }],
    model: "voyage-multimodal-3.5",
    inputType: "query",
  });

  return response.data![0].embedding!;
}

export async function rerank(
  query: string,
  documents: string[],
): Promise<{ index: number; score: number }[]> {
  const response = await voyage.rerank({
    query,
    documents,
    model: "rerank-2.5-lite",
    topK: documents.length,
  });

  return response.data!.map((result) => ({
    index: result.index!,
    score: result.relevanceScore!,
  }));
}

import { cohere } from '@ai-sdk/cohere';
import { rerank } from 'ai';

export async function rerankResults<T extends { content: string; metadata: Record<string, any> }>(
  query: string,
  documents: T[],
  topN = 5
): Promise<T[]> {
  const { ranking } = await rerank({
    model: cohere.reranking('rerank-english-v3.0'),
    query,
    documents: documents.map((d) => d.content),
    topN,
  });

  return ranking.map((r) => documents[r.originalIndex]);
}

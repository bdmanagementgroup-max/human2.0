import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

// Truncated from the model's native 3072 dims — pgvector's ivfflat index
// caps indexable columns at 2000 dimensions. Must match VECTOR_DIMENSIONS
// in vector-store.ts.
export const EMBEDDING_DIMENSIONS = 1536;

export async function embedTexts(texts: string[], model = 'text-embedding-3-large'): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openai.textEmbeddingModel(model),
    values: texts,
    providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
  });
  return embeddings;
}

export async function embedSingle(text: string, model = 'text-embedding-3-large'): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel(model),
    value: text,
    providerOptions: { openai: { dimensions: EMBEDDING_DIMENSIONS } },
  });
  return embedding;
}

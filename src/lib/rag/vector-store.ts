import { neon } from '@neondatabase/serverless';
import { DocumentChunk } from './types';

const sql = neon(process.env.DATABASE_URL!);

const VECTOR_DIMENSIONS = 1536; // must match EMBEDDING_DIMENSIONS in embeddings.ts

const SAFE_METADATA_KEY = /^[a-zA-Z0-9_]+$/;

export async function initVectorStore(): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;

  // VECTOR_DIMENSIONS must be inlined as a literal, not bound as a parameter —
  // Postgres can't bind a parameter inside a DDL type modifier.
  await sql(`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      embedding VECTOR(${VECTOR_DIMENSIONS}) NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await sql`CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`;
  await sql`CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING gin (metadata)`;

  await sql`
    CREATE TABLE IF NOT EXISTS rag_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      query TEXT NOT NULL,
      answer TEXT NOT NULL,
      sources JSONB NOT NULL,
      eval JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS rag_logs_created_at_idx ON rag_logs (created_at DESC)`;
}

export async function upsertDocuments(
  chunks: Array<{ content: string; embedding: number[]; metadata: Record<string, any> }>
): Promise<string[]> {
  const ids: string[] = [];
  for (const chunk of chunks) {
    const [row] = await sql`
      INSERT INTO documents (content, embedding, metadata)
      VALUES (${chunk.content}, ${JSON.stringify(chunk.embedding)}::vector, ${JSON.stringify(chunk.metadata)}::jsonb)
      RETURNING id
    `;
    ids.push(row.id as string);
  }
  return ids;
}

export async function vectorSearch(
  queryEmbedding: number[],
  topK = 10,
  filter: Record<string, any> = {},
  similarityThreshold = 0.3
): Promise<DocumentChunk[]> {
  const filterEntries = Object.entries(filter);
  for (const [key] of filterEntries) {
    if (!SAFE_METADATA_KEY.test(key)) {
      throw new Error(`Invalid filter key: ${key}`);
    }
  }

  const params: any[] = [JSON.stringify(queryEmbedding), similarityThreshold];
  const conditions = filterEntries.map(([key, value]) => {
    params.push(value);
    return `metadata->>'${key}' = $${params.length}`;
  });
  const filterSQL = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

  params.push(topK);
  const topKParamIndex = params.length;

  const results = await sql(
    `SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE 1 - (embedding <=> $1::vector) > $2
     ${filterSQL}
     ORDER BY similarity DESC
     LIMIT $${topKParamIndex}`,
    params
  );

  return (results as any[]).map((r) => ({
    id: r.id,
    content: r.content,
    metadata: r.metadata,
    embedding: [],
    similarity: r.similarity,
  }));
}

export async function logQuery(query: string, answer: string, sources: any[], evalResult: any): Promise<void> {
  await sql`
    INSERT INTO rag_logs (query, answer, sources, eval)
    VALUES (${query}, ${answer}, ${JSON.stringify(sources)}::jsonb, ${JSON.stringify(evalResult)}::jsonb)
  `;
}

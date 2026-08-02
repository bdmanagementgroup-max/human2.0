import { chunkText } from './chunker';
import { embedTexts, embedSingle } from './embeddings';
import { upsertDocuments, vectorSearch, initVectorStore, logQuery } from './vector-store';
import { rerankResults } from './rerank';
import { generateAnswer } from './generate';
import { evaluateAnswer } from './eval';
import { RAGIngestRequest, RAGIngestResponse, RAGQueryRequest, RAGQueryResponse } from './types';

export async function ingestPipeline(request: RAGIngestRequest): Promise<RAGIngestResponse> {
  await initVectorStore();

  const chunks = chunkText(request.text, request.chunkSize, request.chunkOverlap);
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);

  const documents = chunks.map((chunk, i) => ({
    content: chunk.content,
    embedding: embeddings[i],
    metadata: { ...request.metadata, ...chunk.metadata },
  }));

  const chunkIds = await upsertDocuments(documents);

  return { chunksCreated: chunks.length, chunkIds };
}

export async function queryPipeline(request: RAGQueryRequest): Promise<RAGQueryResponse> {
  await initVectorStore();

  const queryEmbedding = await embedSingle(request.query);
  let results = await vectorSearch(queryEmbedding, request.topK || 10, request.filter || {});

  if (request.rerank !== false && results.length > 0) {
    results = await rerankResults(request.query, results);
  }

  const answer = await generateAnswer(request.query, results);
  const evalResult = evaluateAnswer(answer, results);

  await logQuery(request.query, answer, results, evalResult);

  return {
    answer,
    sources: results.map((r, i) => ({
      index: i + 1,
      content: r.content.substring(0, 200) + '...',
      metadata: r.metadata,
      similarity: r.similarity || 0,
    })),
    eval: evalResult,
  };
}

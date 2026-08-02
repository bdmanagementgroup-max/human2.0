export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  similarity?: number;
}

export interface RAGQueryRequest {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
  rerank?: boolean;
}

export interface RAGQueryResponse {
  answer: string;
  sources: Array<{
    index: number;
    content: string;
    metadata: Record<string, any>;
    similarity: number;
  }>;
  eval: {
    hasCitations: boolean;
    citationCount: number;
    sourceCount: number;
  };
}

export interface RAGIngestRequest {
  text: string;
  metadata?: Record<string, any>;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface RAGIngestResponse {
  chunksCreated: number;
  chunkIds: string[];
}

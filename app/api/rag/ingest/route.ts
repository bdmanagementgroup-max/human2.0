import { NextRequest, NextResponse } from 'next/server';
import { ingestPipeline } from '@/src/lib/rag/pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, metadata, chunkSize, chunkOverlap } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: text (string)' },
        { status: 400 }
      );
    }

    const result = await ingestPipeline({
      text,
      metadata,
      chunkSize,
      chunkOverlap
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('RAG Ingest Error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
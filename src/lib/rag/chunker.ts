export function chunkText(
  text: string,
  chunkSize = 1000,
  chunkOverlap = 200
): Array<{ content: string; metadata: { chunkIndex: number; startChar: number; endChar: number } }> {
  const chunks: Array<{ content: string; metadata: { chunkIndex: number; startChar: number; endChar: number } }> = [];
  for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
    const chunk = text.slice(i, i + chunkSize);
    if (chunk.trim().length > 50) {
      chunks.push({
        content: chunk.trim(),
        metadata: {
          chunkIndex: chunks.length,
          startChar: i,
          endChar: Math.min(i + chunkSize, text.length),
        },
      });
    }
  }
  return chunks;
}

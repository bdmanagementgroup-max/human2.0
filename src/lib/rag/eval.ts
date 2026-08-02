export function evaluateAnswer(answer: string, sources: any[]) {
  const hasCitations = /\[\d+\]/.test(answer);
  const citationCount = (answer.match(/\[\d+\]/g) || []).length;

  return {
    hasCitations,
    citationCount,
    sourceCount: sources.length,
  };
}

function chunkText(text, chunkSize = 4000) {
  console.log(`[AI] Chunk Generation Started`);
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  console.log(`[AI] Total Chunks Generated: ${chunks.length}`);
  return chunks;
}

module.exports = {
  chunkText,
};

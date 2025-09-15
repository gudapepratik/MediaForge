export const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB recommended

export async function getFileHash(file) {
  const chunkSize = 2 * 1024 * 1024; // 2MB
  const chunks = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const buffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(buffer));
    offset += chunkSize;
  }

  // Concatenate all chunks
  let totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
  let combined = new Uint8Array(totalLength);
  let position = 0;
  for (let chunk of chunks) {
    combined.set(chunk, position);
    position += chunk.length;
  }

  // Compute hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}


export function sliceForPart(file, partNo) {
  const start = (partNo - 1) * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  return file.slice(start, end);
}

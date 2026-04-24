export function parseApiJson<T>(raw: string): T {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const extracted = extractJsonPayload(trimmed);
    return JSON.parse(extracted) as T;
  }
}

function extractJsonPayload(raw: string): string {
  const arrayStart = raw.indexOf('[');
  const objectStart = raw.indexOf('{');
  const starts = [arrayStart, objectStart].filter((value) => value >= 0);

  if (!starts.length) {
    throw new Error('La respuesta no contiene JSON.');
  }

  const start = Math.min(...starts);
  const arrayEnd = raw.lastIndexOf(']');
  const objectEnd = raw.lastIndexOf('}');
  const end = Math.max(arrayEnd, objectEnd);

  if (end < start) {
    throw new Error('No fue posible extraer el JSON de la respuesta.');
  }

  return raw.slice(start, end + 1);
}

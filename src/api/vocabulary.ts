import type { VocabularyPayload, VocabularyWord } from "../types";

/**
 * Parses a vocabulary payload (either an array of words or an object with a words property)
 * and returns a normalized array of VocabularyWord objects.
 */
export function parseVocabulary(payload: unknown): VocabularyWord[] {
  if (!payload) {
    throw new Error("Vocabulary payload is null or undefined");
  }

  // Check if it's already an array
  if (Array.isArray(payload)) {
    return payload as VocabularyWord[];
  }

  // Check if it's an object with a 'words' property
  if (typeof payload === "object" && payload !== null && "words" in payload) {
    const obj = payload as { words: unknown };
    if (Array.isArray(obj.words)) {
      return obj.words as VocabularyWord[];
    }
  }

  throw new Error("Invalid vocabulary payload format");
}

/**
 * Fetches vocabulary words from a remote URL.
 * Returns a promise that resolves to an array of VocabularyWord objects.
 */
export async function fetchVocabulary(url: string): Promise<VocabularyWord[]> {
  if (!url) {
    throw new Error("Vocabulary URL is required");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    return parseVocabulary(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch vocabulary from ${url}: ${message}`);
  }
}


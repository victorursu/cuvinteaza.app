import type { VocabularyWord } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVocabularyWord(value: unknown): value is VocabularyWord {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.grammar_block === "string" &&
    typeof value.definition === "string" &&
    typeof value.image === "string" &&
    Array.isArray(value.tags) &&
    value.tags.every((t) => typeof t === "string") &&
    Array.isArray(value.examples) &&
    value.examples.every((e) => typeof e === "string")
  );
}

export function parseVocabulary(data: unknown): VocabularyWord[] {
  // Accept either:
  // 1) top-level array of words: VocabularyWord[]
  // 2) wrapped object: { words: VocabularyWord[] }
  let words: unknown[] | undefined;
  if (Array.isArray(data)) words = data;
  else if (isRecord(data) && Array.isArray(data.words)) words = data.words;
  else throw new Error("Invalid vocabulary JSON shape");

  if (!words.every(isVocabularyWord)) {
    throw new Error("Invalid vocabulary word entries");
  }

  return words;
}

export async function fetchVocabulary(url: string): Promise<VocabularyWord[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load vocabulary (${res.status})`);
  }

  const data: unknown = await res.json();
  return parseVocabulary(data);
}



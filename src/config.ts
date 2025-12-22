export const VOCABULARY_URL =
  process.env.EXPO_PUBLIC_VOCABULARY_URL ??
  "https://example.com/vocabulary.ro.json";

export const TEST_URL =
  process.env.EXPO_PUBLIC_TEST_URL ?? "https://example.com/test.ro.json";

export const TEST_COUNT = Number(process.env.EXPO_PUBLIC_TEST_COUNT ?? "30") || 30;

export const TEST_REVEAL_MS =
  Number(process.env.EXPO_PUBLIC_TEST_REVEAL_MS ?? "2000") || 2000;

export const REGIONALISME_URL =
  process.env.EXPO_PUBLIC_REGIONALISME_URL ??
  "https://example.com/regionalisme.ro.json";

export const URBANISME_URL =
  process.env.EXPO_PUBLIC_URBANISME_URL ??
  "https://example.com/urbanisme.ro.json";

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";


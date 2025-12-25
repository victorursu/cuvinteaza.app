import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { VocabularyWord } from "../types";

/**
 * Fetch words from Supabase that have tags containing "urban" or "slang"
 * @param limit - Maximum number of words to fetch (default: 15)
 * @returns Array of VocabularyWord objects
 */
export async function fetchUrbanismeFromSupabase(limit: number = 15): Promise<VocabularyWord[]> {
  console.log(`[fetchUrbanismeFromSupabase] ===== Starting fetch =====`);
  console.log(`[fetchUrbanismeFromSupabase] isSupabaseConfigured: ${isSupabaseConfigured}`);
  console.log(`[fetchUrbanismeFromSupabase] supabase exists: ${!!supabase}`);
  console.log(`[fetchUrbanismeFromSupabase] limit: ${limit}`);
  
  if (!isSupabaseConfigured || !supabase) {
    console.error("[fetchUrbanismeFromSupabase] ❌ Supabase is not configured");
    throw new Error("Supabase is not configured");
  }

  try {
    console.log(`[fetchUrbanismeFromSupabase] Querying Supabase for words with tags "urban" or "slang"...`);
    
    // Query all words and filter in JavaScript (most reliable approach)
    console.log(`[fetchUrbanismeFromSupabase] Fetching all words and filtering in JavaScript...`);
    const { data: allData, error } = await supabase
      .from("cuvinteziCuvinte")
      .select("id, title, grammar_block, definition, image, tags, examples")
      .limit(1000); // Fetch enough to get all words (or most of them)
    
    console.log(`[fetchUrbanismeFromSupabase] Query result - data length: ${allData?.length || 0}`);
    console.log(`[fetchUrbanismeFromSupabase] Query result - error:`, error);
    
    if (error) {
      console.error("Error fetching words from Supabase:", error);
      throw error;
    }

    if (!allData || allData.length === 0) {
      console.log(`[fetchUrbanismeFromSupabase] ⚠️ No words found in database at all!`);
      console.log(`[fetchUrbanismeFromSupabase] 💡 Make sure you've run the import script: supabase_scripts/supabase_cuvinte_import.sql`);
      return [];
    }

    // Log first few words to debug
    console.log(`[fetchUrbanismeFromSupabase] First word sample:`, JSON.stringify(allData[0], null, 2));
    console.log(`[fetchUrbanismeFromSupabase] First word tags type:`, typeof allData[0]?.tags);
    console.log(`[fetchUrbanismeFromSupabase] First word tags value:`, allData[0]?.tags);
    console.log(`[fetchUrbanismeFromSupabase] First word tags is array:`, Array.isArray(allData[0]?.tags));

    // Filter words that have "urban" or "slang" in their tags
    const filteredData = allData.filter((word) => {
      let tags: string[] = [];
      
      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          console.log(`[fetchUrbanismeFromSupabase] Failed to parse tags as JSON:`, word.tags);
          return false;
        }
      } else if (word.tags) {
        // Try to handle other formats
        console.log(`[fetchUrbanismeFromSupabase] Unexpected tags type:`, typeof word.tags, word.tags);
        return false;
      } else {
        return false;
      }

      // Check if tags array contains "urban" or "slang" (case-insensitive)
      const hasMatch = tags.some(
        (tag) => tag.toLowerCase() === "urban" || tag.toLowerCase() === "slang"
      );
      
      if (hasMatch) {
        console.log(`[fetchUrbanismeFromSupabase] ✅ Found match in word "${word.title}" with tags:`, tags);
      }
      
      return hasMatch;
    });

    // Shuffle the filtered data to get random selection
    const shuffled = filteredData.sort(() => Math.random() - 0.5);
    
    // Limit to requested number (randomly selected)
    const data = shuffled.slice(0, limit);
    console.log(`[fetchUrbanismeFromSupabase] Filtered to ${filteredData.length} words with "urban" or "slang" tags, randomly selected ${data.length}`);

    // Convert Supabase data to VocabularyWord format
    // Supabase returns tags and examples as JSONB (arrays), but we need to ensure they're arrays
    return data.map((word) => {
      // Parse tags and examples if they're strings, otherwise use as-is
      let tags: string[] = [];
      let examples: string[] = [];

      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          tags = [];
        }
      }

      if (Array.isArray(word.examples)) {
        examples = word.examples;
      } else if (typeof word.examples === "string") {
        try {
          examples = JSON.parse(word.examples);
        } catch {
          examples = [];
        }
      }

      return {
        id: word.id,
        title: word.title,
        grammar_block: word.grammar_block || "",
        definition: word.definition,
        image: word.image || "",
        tags,
        examples,
      } as VocabularyWord;
    });
  } catch (error) {
    console.error("Failed to fetch urbanisme from Supabase:", error);
    throw error;
  }
}

/**
 * Fetch words from Supabase that have tags containing "regionalisme" or "regionalism"
 * @param limit - Maximum number of words to fetch (default: 15)
 * @returns Array of VocabularyWord objects
 */
export async function fetchRegionalismeFromSupabase(limit: number = 15): Promise<VocabularyWord[]> {
  console.log(`[fetchRegionalismeFromSupabase] ===== Starting fetch =====`);
  console.log(`[fetchRegionalismeFromSupabase] isSupabaseConfigured: ${isSupabaseConfigured}`);
  console.log(`[fetchRegionalismeFromSupabase] supabase exists: ${!!supabase}`);
  console.log(`[fetchRegionalismeFromSupabase] limit: ${limit}`);
  
  if (!isSupabaseConfigured || !supabase) {
    console.error("[fetchRegionalismeFromSupabase] ❌ Supabase is not configured");
    throw new Error("Supabase is not configured");
  }

  try {
    console.log(`[fetchRegionalismeFromSupabase] Querying Supabase for words with tags "regionalisme" or "regionalism"...`);
    
    // Query all words and filter in JavaScript (most reliable approach)
    console.log(`[fetchRegionalismeFromSupabase] Fetching all words and filtering in JavaScript...`);
    const { data: allData, error } = await supabase
      .from("cuvinteziCuvinte")
      .select("id, title, grammar_block, definition, image, tags, examples")
      .limit(1000); // Fetch enough to get all words (or most of them)
    
    console.log(`[fetchRegionalismeFromSupabase] Query result - data length: ${allData?.length || 0}`);
    console.log(`[fetchRegionalismeFromSupabase] Query result - error:`, error);
    
    if (error) {
      console.error("Error fetching words from Supabase:", error);
      throw error;
    }

    if (!allData || allData.length === 0) {
      console.log(`[fetchRegionalismeFromSupabase] ⚠️ No words found in database at all!`);
      console.log(`[fetchRegionalismeFromSupabase] 💡 Make sure you've run the import script: supabase_scripts/supabase_cuvinte_import.sql`);
      return [];
    }

    // Log first few words to debug
    console.log(`[fetchRegionalismeFromSupabase] First word sample:`, JSON.stringify(allData[0], null, 2));
    console.log(`[fetchRegionalismeFromSupabase] First word tags type:`, typeof allData[0]?.tags);
    console.log(`[fetchRegionalismeFromSupabase] First word tags value:`, allData[0]?.tags);
    console.log(`[fetchRegionalismeFromSupabase] First word tags is array:`, Array.isArray(allData[0]?.tags));

    // Filter words that have "regionalisme" or "regionalism" in their tags
    const filteredData = allData.filter((word) => {
      let tags: string[] = [];
      
      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          console.log(`[fetchRegionalismeFromSupabase] Failed to parse tags as JSON:`, word.tags);
          return false;
        }
      } else if (word.tags) {
        // Try to handle other formats
        console.log(`[fetchRegionalismeFromSupabase] Unexpected tags type:`, typeof word.tags, word.tags);
        return false;
      } else {
        return false;
      }

      // Check if tags array contains "regionalisme" or "regionalism" (case-insensitive)
      const hasMatch = tags.some(
        (tag) => tag.toLowerCase() === "regionalisme" || tag.toLowerCase() === "regionalism"
      );
      
      if (hasMatch) {
        console.log(`[fetchRegionalismeFromSupabase] ✅ Found match in word "${word.title}" with tags:`, tags);
      }
      
      return hasMatch;
    });

    // Shuffle the filtered data to get random selection
    const shuffled = filteredData.sort(() => Math.random() - 0.5);
    
    // Limit to requested number (randomly selected)
    const data = shuffled.slice(0, limit);
    console.log(`[fetchRegionalismeFromSupabase] Filtered to ${filteredData.length} words with "regionalisme" or "regionalism" tags, randomly selected ${data.length}`);

    // Convert Supabase data to VocabularyWord format
    // Supabase returns tags and examples as JSONB (arrays), but we need to ensure they're arrays
    return data.map((word) => {
      // Parse tags and examples if they're strings, otherwise use as-is
      let tags: string[] = [];
      let examples: string[] = [];

      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          tags = [];
        }
      }

      if (Array.isArray(word.examples)) {
        examples = word.examples;
      } else if (typeof word.examples === "string") {
        try {
          examples = JSON.parse(word.examples);
        } catch {
          examples = [];
        }
      }

      return {
        id: word.id,
        title: word.title,
        grammar_block: word.grammar_block || "",
        definition: word.definition,
        image: word.image || "",
        tags,
        examples,
      } as VocabularyWord;
    });
  } catch (error) {
    console.error("Failed to fetch regionalisme from Supabase:", error);
    throw error;
  }
}

/**
 * Fetch daily words from Supabase (from cuvinteziDailyWords table)
 * @returns Array of VocabularyWord objects ordered by date (most recent first)
 */
export async function fetchDailyWordsFromSupabase(): Promise<VocabularyWord[]> {
  console.log(`[fetchDailyWordsFromSupabase] ===== Starting fetch =====`);
  console.log(`[fetchDailyWordsFromSupabase] isSupabaseConfigured: ${isSupabaseConfigured}`);
  console.log(`[fetchDailyWordsFromSupabase] supabase exists: ${!!supabase}`);

  if (!isSupabaseConfigured || !supabase) {
    console.error("[fetchDailyWordsFromSupabase] ❌ Supabase is not configured");
    throw new Error("Supabase is not configured");
  }

  try {
    console.log(`[fetchDailyWordsFromSupabase] Querying Supabase for daily words...`);

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`[fetchDailyWordsFromSupabase] Filtering for dates <= ${today}`);

    // First, fetch daily words ordered by date (most recent first)
    // Only include words with dates <= current date (exclude future dates)
    const { data: dailyWordsData, error: dailyWordsError } = await supabase
      .from("cuvinteziDailyWords")
      .select("word_id, date")
      .lte("date", today)
      .order("date", { ascending: false });

    console.log(`[fetchDailyWordsFromSupabase] Daily words query result - data length: ${dailyWordsData?.length || 0}`);
    console.log(`[fetchDailyWordsFromSupabase] Daily words query result - error:`, dailyWordsError);

    if (dailyWordsError) {
      console.error("Error fetching daily words from Supabase:", dailyWordsError);
      throw dailyWordsError;
    }

    if (!dailyWordsData || dailyWordsData.length === 0) {
      console.log(`[fetchDailyWordsFromSupabase] ⚠️ No daily words found in database!`);
      return [];
    }

    // Extract word IDs
    const wordIds = dailyWordsData.map((dw) => dw.word_id).filter(Boolean);
    console.log(`[fetchDailyWordsFromSupabase] Found ${wordIds.length} daily word IDs:`, wordIds);

    if (wordIds.length === 0) {
      console.log(`[fetchDailyWordsFromSupabase] ⚠️ No valid word IDs found!`);
      return [];
    }

    // Fetch full word details from cuvinteziCuvinte
    const { data: wordsData, error: wordsError } = await supabase
      .from("cuvinteziCuvinte")
      .select("id, title, grammar_block, definition, image, tags, examples")
      .in("id", wordIds);

    console.log(`[fetchDailyWordsFromSupabase] Words query result - data length: ${wordsData?.length || 0}`);
    console.log(`[fetchDailyWordsFromSupabase] Words query result - error:`, wordsError);

    if (wordsError) {
      console.error("Error fetching words from Supabase:", wordsError);
      throw wordsError;
    }

    if (!wordsData || wordsData.length === 0) {
      console.log(`[fetchDailyWordsFromSupabase] ⚠️ No words found for the daily word IDs!`);
      return [];
    }

    // Convert Supabase data to VocabularyWord format
    const vocabularyWords: VocabularyWord[] = wordsData.map((word) => {
      let tags: string[] = [];
      let examples: string[] = [];

      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          tags = [];
        }
      }

      if (Array.isArray(word.examples)) {
        examples = word.examples;
      } else if (typeof word.examples === "string") {
        try {
          examples = JSON.parse(word.examples);
        } catch {
          examples = [];
        }
      }

      return {
        id: word.id,
        title: word.title,
        grammar_block: word.grammar_block || "",
        definition: word.definition,
        image: word.image || "",
        tags,
        examples,
      } as VocabularyWord;
    });

    // Maintain the order from dailyWordsData (most recent first)
    const orderedWords = dailyWordsData
      .map((dw) => vocabularyWords.find((w) => w.id === dw.word_id))
      .filter((w): w is VocabularyWord => w !== undefined);

    console.log(`[fetchDailyWordsFromSupabase] ✅ Successfully fetched ${orderedWords.length} daily words`);
    return orderedWords;
  } catch (error) {
    console.error("Failed to fetch daily words from Supabase:", error);
    throw error;
  }
}

/**
 * Fetch the date when a word is a daily word
 * @param wordId - The ID of the word to check
 * @returns The date string (YYYY-MM-DD) or null if not a daily word
 */
export async function fetchDailyWordDate(wordId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("cuvinteziDailyWords")
      .select("date")
      .eq("word_id", wordId)
      .lte("date", today)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Error fetching daily word date:", error);
      return null;
    }

    // Only return date if it's <= current date
    const wordDate = data?.date;
    if (wordDate && wordDate <= today) {
      return wordDate;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch daily word date:", error);
    return null;
  }
}

/**
 * Fetch daily word dates for multiple words at once
 * @param wordIds - Array of word IDs to check
 * @returns Map of wordId to date string (YYYY-MM-DD)
 */
export async function fetchDailyWordDates(wordIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  
  if (!isSupabaseConfigured || !supabase || wordIds.length === 0) {
    return result;
  }

  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("cuvinteziDailyWords")
      .select("word_id, date")
      .in("word_id", wordIds)
      .lte("date", today);

    if (error) {
      console.error("Error fetching daily word dates:", error);
      return result;
    }

    if (data) {
      data.forEach((item) => {
        // Only include dates that are <= current date
        if (item.word_id && item.date && item.date <= today) {
          result.set(item.word_id, item.date);
        }
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch daily word dates:", error);
    return result;
  }
}

/**
 * Fetch a single word from Supabase by ID
 * @param wordId - The ID of the word to fetch
 * @returns VocabularyWord object or null if not found
 */
export async function fetchWordByIdFromSupabase(wordId: string): Promise<VocabularyWord | null> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const { data, error } = await supabase
      .from("cuvinteziCuvinte")
      .select("id, title, grammar_block, definition, image, tags, examples")
      .eq("id", wordId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Convert Supabase data to VocabularyWord format
    let tags: string[] = [];
    let examples: string[] = [];

    if (Array.isArray(data.tags)) {
      tags = data.tags;
    } else if (typeof data.tags === "string") {
      try {
        tags = JSON.parse(data.tags);
      } catch {
        tags = [];
      }
    }

    if (Array.isArray(data.examples)) {
      examples = data.examples;
    } else if (typeof data.examples === "string") {
      try {
        examples = JSON.parse(data.examples);
      } catch {
        examples = [];
      }
    }

    return {
      id: data.id,
      title: data.title,
      grammar_block: data.grammar_block || "",
      definition: data.definition,
      image: data.image || "",
      tags,
      examples,
    } as VocabularyWord;
  } catch (error) {
    console.error("Failed to fetch word by ID from Supabase:", error);
    throw error;
  }
}


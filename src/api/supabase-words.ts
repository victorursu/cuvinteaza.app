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


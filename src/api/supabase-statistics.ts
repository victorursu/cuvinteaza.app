import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { VocabularyWord } from "../types";

export interface Statistics {
  topLikedWords: Array<{ word: VocabularyWord; likes: number; rank: number }>;
  activeUsers: number;
  totalUsers: number;
  totalWords: number;
  distinctTags: number;
  regionalismeWords: number;
  urbanismeWords: number;
}

/**
 * Fetch top 5 most liked words by the community
 */
export async function fetchTopLikedWords(limit: number = 5): Promise<Array<{ word: VocabularyWord; likes: number; rank: number }>> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    // Use database function to get accurate counts (bypasses RLS issues)
    const { data: likesData, error: likesError } = await supabase
      .rpc("get_top_liked_words", { limit_count: limit });

    if (likesError) {
      console.error("Error fetching top liked words:", likesError);
      // Fallback to old method if function doesn't exist
      console.log("Falling back to manual count method...");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("cuvinteziLikes")
        .select("word_id");

      if (fallbackError) {
        console.error("Error fetching likes (fallback):", fallbackError);
        return [];
      }

      // Count likes per word
      const wordLikeCounts = new Map<string, number>();
      fallbackData?.forEach((like) => {
        const count = wordLikeCounts.get(like.word_id) || 0;
        wordLikeCounts.set(like.word_id, count + 1);
      });

      // Sort by like count and get top N
      const sortedWords = Array.from(wordLikeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      // Continue with existing logic below
      const topWords: Array<{ word: VocabularyWord; likes: number; rank: number }> = [];
      
      for (let i = 0; i < sortedWords.length; i++) {
        const [wordId, likes] = sortedWords[i];
        
        const { data: wordData, error: wordError } = await supabase
          .from("cuvinteziCuvinte")
          .select(`
            id, 
            title, 
            grammar_block, 
            definition, 
            image, 
            examples,
            cuvinteziCuvinteTags (
              cuvinteziTags (
                label
              )
            )
          `)
          .eq("id", wordId)
          .single();

        if (!wordError && wordData) {
          // Extract tags from junction table
          const tags: string[] = [];
          if ((wordData as any).cuvinteziCuvinteTags && Array.isArray((wordData as any).cuvinteziCuvinteTags)) {
            (wordData as any).cuvinteziCuvinteTags.forEach((junction: any) => {
              if (junction.cuvinteziTags && junction.cuvinteziTags.label) {
                tags.push(junction.cuvinteziTags.label);
              }
            });
          }
          
          let examples: string[] = [];
          if (Array.isArray(wordData.examples)) {
            examples = wordData.examples;
          } else if (typeof wordData.examples === "string") {
            try {
              examples = JSON.parse(wordData.examples);
            } catch {
              examples = [];
            }
          }

          topWords.push({
            word: {
              id: String(wordData.id), // Convert BIGINT to string
              title: wordData.title,
              grammar_block: wordData.grammar_block || "",
              definition: wordData.definition,
              image: wordData.image || "",
              tags,
              examples,
            } as VocabularyWord,
            likes,
            rank: i + 1,
          });
        }
      }

      return topWords;
    }

    if (!likesData || likesData.length === 0) {
      return [];
    }

    // Sort by like count and get top N (already sorted by function, but ensure order)
    const sortedWords = likesData
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, limit);

    // Fetch word details for top liked words
    const topWords: Array<{ word: VocabularyWord; likes: number; rank: number }> = [];
    
    for (let i = 0; i < sortedWords.length; i++) {
      const item = sortedWords[i];
      const wordId = item.word_id;
      const likes = Number(item.like_count);
      const rank = item.rank_number || i + 1;
      
      const { data: wordData, error: wordError } = await supabase
        .from("cuvinteziCuvinte")
        .select(`
          id, 
          title, 
          grammar_block, 
          definition, 
          image, 
          examples,
          cuvinteziCuvinteTags (
            cuvinteziTags (
              label
            )
          )
        `)
        .eq("id", wordId)
        .single();

      if (!wordError && wordData) {
        // Extract tags from junction table
        const tags: string[] = [];
        if ((wordData as any).cuvinteziCuvinteTags && Array.isArray((wordData as any).cuvinteziCuvinteTags)) {
          (wordData as any).cuvinteziCuvinteTags.forEach((junction: any) => {
            if (junction.cuvinteziTags && junction.cuvinteziTags.label) {
              tags.push(junction.cuvinteziTags.label);
            }
          });
        }
        
        let examples: string[] = [];
        if (Array.isArray(wordData.examples)) {
          examples = wordData.examples;
        } else if (typeof wordData.examples === "string") {
          try {
            examples = JSON.parse(wordData.examples);
          } catch {
            examples = [];
          }
        }

        topWords.push({
          word: {
            id: String(wordData.id), // Convert BIGINT to string
            title: wordData.title,
            grammar_block: wordData.grammar_block || "",
            definition: wordData.definition,
            image: wordData.image || "",
            tags,
            examples,
          } as VocabularyWord,
          likes,
          rank,
        });
      }
    }

    return topWords;
  } catch (error) {
    console.error("Failed to fetch top liked words:", error);
    return [];
  }
}

/**
 * Fetch all statistics
 */
export async function fetchStatistics(): Promise<Statistics> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      topLikedWords: [],
      activeUsers: 0,
      totalUsers: 0,
      totalWords: 0,
      distinctTags: 0,
      regionalismeWords: 0,
      urbanismeWords: 0,
    };
  }

  try {
    // Fetch all statistics in parallel
    const [
      topLikedWords,
      activeUsersResult,
      totalUsersResult,
      totalWordsResult,
      allWordsResult,
    ] = await Promise.all([
      fetchTopLikedWords(3),
      supabase
        .from("cuvinteziProfile")
        .select("user_id", { count: "exact", head: true }),
      // Count total users - use database function to get accurate count (bypasses RLS)
      supabase
        .rpc("get_total_users_from_likes"),
      supabase
        .from("cuvinteziCuvinte")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("cuvinteziCuvinte")
        .select(`
          id,
          cuvinteziCuvinteTags (
            cuvinteziTags (
              label
            )
          )
        `),
    ]);

    const activeUsers = activeUsersResult.count || 0;
    // Get total users from database function (accurate count, bypasses RLS)
    // RPC returns the value directly, so data is the number itself
    let totalUsers = 0;
    if (totalUsersResult.data !== null && totalUsersResult.data !== undefined) {
      totalUsers = typeof totalUsersResult.data === 'number' 
        ? totalUsersResult.data 
        : Number(totalUsersResult.data) || 0;
    }
    
    // Fallback: if RPC fails, try to count from likes (may be filtered by RLS)
    if (totalUsers === 0 && totalUsersResult.error) {
      console.warn("RPC get_total_users_from_likes failed, using fallback:", totalUsersResult.error);
      const { data: fallbackData } = await supabase
        .from("cuvinteziLikes")
        .select("user_id");
      const uniqueUserIds = new Set(
        fallbackData?.map((row) => row.user_id) || []
      );
      totalUsers = uniqueUserIds.size;
    }
    const totalWords = totalWordsResult.count || 0;

    // Count distinct tags and categorize words
    const allTags = new Set<string>();
    let regionalismeWords = 0;
    let urbanismeWords = 0;

    allWordsResult.data?.forEach((word: any) => {
      // Extract tags from junction table
      const tags: string[] = [];
      if (word.cuvinteziCuvinteTags && Array.isArray(word.cuvinteziCuvinteTags)) {
        word.cuvinteziCuvinteTags.forEach((junction: any) => {
          if (junction.cuvinteziTags && junction.cuvinteziTags.label) {
            tags.push(junction.cuvinteziTags.label);
          }
        });
      }

      tags.forEach((tag) => allTags.add(tag.toLowerCase()));

      const lowerTags = tags.map((t) => t.toLowerCase());
      if (
        lowerTags.includes("regionalisme") ||
        lowerTags.includes("regionalism")
      ) {
        regionalismeWords++;
      }
      if (lowerTags.includes("urban") || lowerTags.includes("slang")) {
        urbanismeWords++;
      }
    });

    return {
      topLikedWords,
      activeUsers,
      totalUsers,
      totalWords,
      distinctTags: allTags.size,
      regionalismeWords,
      urbanismeWords,
    };
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return {
      topLikedWords: [],
      activeUsers: 0,
      totalUsers: 0,
      totalWords: 0,
      distinctTags: 0,
      regionalismeWords: 0,
      urbanismeWords: 0,
    };
  }
}


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
    // Count likes per word_id
    const { data: likesData, error: likesError } = await supabase
      .from("cuvinteziLikes")
      .select("word_id");

    if (likesError) {
      console.error("Error fetching likes:", likesError);
      return [];
    }

    // Count likes per word
    const wordLikeCounts = new Map<string, number>();
    likesData?.forEach((like) => {
      const count = wordLikeCounts.get(like.word_id) || 0;
      wordLikeCounts.set(like.word_id, count + 1);
    });

    // Sort by like count and get top N
    const sortedWords = Array.from(wordLikeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Fetch word details for top liked words
    const topWords: Array<{ word: VocabularyWord; likes: number; rank: number }> = [];
    
    for (let i = 0; i < sortedWords.length; i++) {
      const [wordId, likes] = sortedWords[i];
      
      const { data: wordData, error: wordError } = await supabase
        .from("cuvinteziCuvinte")
        .select("id, title, grammar_block, definition, image, tags, examples")
        .eq("id", wordId)
        .single();

      if (!wordError && wordData) {
        let tags: string[] = [];
        let examples: string[] = [];

        if (Array.isArray(wordData.tags)) {
          tags = wordData.tags;
        } else if (typeof wordData.tags === "string") {
          try {
            tags = JSON.parse(wordData.tags);
          } catch {
            tags = [];
          }
        }

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
            id: wordData.id,
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
      // Count total users - get distinct user_ids from likes table
      // This represents users who have interacted with the app (liked words)
      supabase
        .from("cuvinteziLikes")
        .select("user_id"),
      supabase
        .from("cuvinteziCuvinte")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("cuvinteziCuvinte")
        .select("tags"),
    ]);

    const activeUsers = activeUsersResult.count || 0;
    // Count distinct user_ids from likes to get total users
    const uniqueUserIds = new Set(
      totalUsersResult.data?.map((row) => row.user_id) || []
    );
    const totalUsers = uniqueUserIds.size;
    const totalWords = totalWordsResult.count || 0;

    // Count distinct tags
    const allTags = new Set<string>();
    allWordsResult.data?.forEach((word) => {
      let tags: string[] = [];
      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          // Ignore parse errors
        }
      }
      tags.forEach((tag) => allTags.add(tag.toLowerCase()));
    });

    // Count regionalisme and urbanisme words
    let regionalismeWords = 0;
    let urbanismeWords = 0;

    allWordsResult.data?.forEach((word) => {
      let tags: string[] = [];
      if (Array.isArray(word.tags)) {
        tags = word.tags;
      } else if (typeof word.tags === "string") {
        try {
          tags = JSON.parse(word.tags);
        } catch {
          // Ignore parse errors
        }
      }

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


import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { VocabularyWord } from "../types";
import { fetchVocabulary, parseVocabulary } from "../api/vocabulary";
import {
  VOCABULARY_URL,
  REGIONALISME_URL,
  URBANISME_URL,
} from "../config";
import fallbackVocabulary from "../data/fallbackVocabulary.ro.json";
import fallbackRegionalisme from "../data/fallbackRegionalisme.ro.json";
import fallbackUrbanisme from "../data/fallbackUrbanisme.ro.json";
import { useTheme } from "../theme/theme";
import { TrashIcon } from "./icons/TrashIcon";
import { HeartIcon } from "./icons/HeartIcon";

type LikedWordWithDate = VocabularyWord & { created_at: string };

const ITEMS_PER_PAGE = 5;

export function LikedWords({ session }: { session: Session }) {
  const { theme } = useTheme();
  const [likedWords, setLikedWords] = useState<LikedWordWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isListExpanded, setIsListExpanded] = useState(false);

  const toggleExpand = useCallback((wordId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const loadLikedWords = async () => {
      try {
        // Get liked word IDs with created_at from Supabase, sorted by newest first
        const { data: likesData, error: likesError } = await supabase
          .from("cuvinteziLikes")
          .select("word_id, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (likesError) {
          console.error("Failed to load liked words:", likesError);
          setLoading(false);
          return;
        }

        if (!likesData || likesData.length === 0) {
          setLikedWords([]);
          setLoading(false);
          return;
        }

        // Create a map of word_id to created_at
        const wordIdToDate = new Map<string, string>();
        likesData.forEach((row) => {
          wordIdToDate.set(row.word_id, row.created_at);
        });

        const likedWordIds = new Set(likesData.map((row) => row.word_id));

        // Fetch all vocabulary from all sources
        const allWords: VocabularyWord[] = [];

        // Fetch from cuvinte (vocabulary)
        try {
          const words = await fetchVocabulary(VOCABULARY_URL);
          allWords.push(...words);
        } catch (e) {
          try {
            const localWords = parseVocabulary(
              fallbackVocabulary as unknown
            );
            allWords.push(...localWords);
          } catch (err) {
            console.error("Failed to load vocabulary:", err);
          }
        }

        // Fetch from regionalisme
        try {
          const words = await fetchVocabulary(REGIONALISME_URL);
          allWords.push(...words);
        } catch (e) {
          try {
            const localWords = parseVocabulary(
              fallbackRegionalisme as unknown
            );
            allWords.push(...localWords);
          } catch (err) {
            console.error("Failed to load regionalisme:", err);
          }
        }

        // Fetch from urbanisme
        try {
          const words = await fetchVocabulary(URBANISME_URL);
          allWords.push(...words);
        } catch (e) {
          try {
            const localWords = parseVocabulary(
              fallbackUrbanisme as unknown
            );
            allWords.push(...localWords);
          } catch (err) {
            console.error("Failed to load urbanisme:", err);
          }
        }

        // Match liked word IDs with full word data and add created_at
        const matchedWords: LikedWordWithDate[] = allWords
          .filter((word) => likedWordIds.has(word.id))
          .map((word) => ({
            ...word,
            created_at: wordIdToDate.get(word.id) || new Date().toISOString(),
          }))
          // Sort by created_at (newest first) - should already be sorted from DB, but ensure it
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });

        setLikedWords(matchedWords);
        // Reset to page 1 when data changes
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to load liked words:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadLikedWords();
  }, [session]);

  const handleDelete = useCallback(
    async (wordId: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return;
      }

      try {
        const { error } = await supabase
          .from("cuvinteziLikes")
          .delete()
          .eq("user_id", session.user.id)
          .eq("word_id", wordId);

        if (error) {
          console.error("Failed to delete like:", error);
          return;
        }

        // Remove from local state
        setLikedWords((prev) => prev.filter((word) => word.id !== wordId));
        // Close if expanded
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(wordId);
          return next;
        });
        // Adjust page if needed
        const totalPages = Math.ceil((likedWords.length - 1) / ITEMS_PER_PAGE);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (error) {
        console.error("Failed to delete like:", error);
      }
    },
    [session, likedWords.length, currentPage]
  );

  // Pagination calculations
  const totalPages = Math.ceil(likedWords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedWords = useMemo(
    () => likedWords.slice(startIndex, endIndex),
    [likedWords, startIndex, endIndex]
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const toggleListExpanded = useCallback(() => {
    setIsListExpanded((prev) => !prev);
  }, []);

  // Swipe gesture handler
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to horizontal swipes
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
            Math.abs(gestureState.dx) > 10
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          const SWIPE_THRESHOLD = 50;
          const { dx } = gestureState;

          // Swipe right (positive dx) = previous page
          if (dx > SWIPE_THRESHOLD) {
            goToPrevPage();
          }
          // Swipe left (negative dx) = next page
          else if (dx < -SWIPE_THRESHOLD) {
            goToNextPage();
          }
        },
      }),
    [goToNextPage, goToPrevPage]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.iconActive} />
      </View>
    );
  }

  if (likedWords.length === 0) {
    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        <Pressable
          onPress={toggleListExpanded}
          style={styles.titleRow}
        >
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Cuvintele tale speciale
          </Text>
          <View style={styles.heartCountContainer}>
            <HeartIcon size={20} color="#FF6B9D" filled={true} />
            <Text style={[styles.heartCount, { color: theme.colors.textSecondary }]}>
              0
            </Text>
          </View>
        </Pressable>
        {isListExpanded && (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nu ai încă cuvinte favorite. Apasă pe inimă pentru a le adăuga!
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Pressable
        onPress={toggleListExpanded}
        style={styles.titleRow}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Cuvintele tale speciale
        </Text>
        <View style={styles.heartCountContainer}>
          <HeartIcon size={20} color="#FF6B9D" filled={true} />
          <Text style={[styles.heartCount, { color: theme.colors.textSecondary }]}>
            {likedWords.length}
          </Text>
        </View>
      </Pressable>
      {isListExpanded && (
        <>
          <View style={styles.wordsList}>
        {paginatedWords.map((word) => {
          const isExpanded = expandedIds.has(word.id);
          return (
            <View
              key={word.id}
              style={[
                styles.wordItem,
                {
                  backgroundColor: theme.colors.tabBarBg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.wordHeaderRow}>
                <Pressable
                  onPress={() => toggleExpand(word.id)}
                  style={styles.wordHeader}
                >
                  <View style={styles.wordHeaderContent}>
                    <Text
                      style={[styles.wordTitle, { color: theme.colors.textPrimary }]}
                    >
                      {word.title}
                    </Text>
                    <Text
                      style={[
                        styles.grammarBlock,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {word.grammar_block}
                    </Text>
                  </View>
                  <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>
                    {isExpanded ? "⌄" : "›"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(word.id)}
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favorites"
                >
                  <TrashIcon size={18} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              {isExpanded && (
                <View style={styles.wordContent}>
                  <Text
                    style={[
                      styles.definition,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {word.definition}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Pressable
                onPress={goToPrevPage}
                disabled={currentPage === 1}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor: theme.colors.tabBarBg,
                    borderColor: theme.colors.border,
                    opacity: currentPage === 1 ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.paginationButtonText, { color: theme.colors.textPrimary }]}>
                  Prev
                </Text>
              </Pressable>
              <Text style={[styles.paginationInfo, { color: theme.colors.textSecondary }]}>
                [{currentPage}/{totalPages}]
              </Text>
              <Pressable
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor: theme.colors.tabBarBg,
                    borderColor: theme.colors.border,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.paginationButtonText, { color: theme.colors.textPrimary }]}>
                  Next
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
  },
  heartCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heartCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  wordsList: {
    gap: 12,
  },
  wordItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  wordHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    padding: 16,
    gap: 12,
  },
  wordHeaderContent: {
    flex: 1,
    gap: 4,
  },
  deleteButton: {
    padding: 12,
    marginRight: 8,
  },
  wordTitle: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "600",
  },
  grammarBlock: {
    fontSize: 14,
    fontStyle: "italic",
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: "600",
  },
  wordContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 50,
    textAlign: "center",
  },
});


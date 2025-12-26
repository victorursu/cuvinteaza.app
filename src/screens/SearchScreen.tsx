import { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import { searchWordsFromSupabase, fetchAllWordsFromSupabase, getTotalWordCount } from "../api/supabase-words";
import type { VocabularyWord } from "../types";
import { WordCard } from "./DictionaryScreen";
import { fetchDailyWordDates } from "../api/supabase-words";
import { isSupabaseConfigured } from "../lib/supabase";
import { useWindowDimensions } from "react-native";
import { List, Grid3x3 } from "lucide-react-native";

export function SearchScreen({
  onNavigateToWord,
}: {
  onNavigateToWord?: (wordId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme, toggle } = useTheme();
  const { width, height } = useWindowDimensions();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dailyWordDates, setDailyWordDates] = useState<Map<string, string | null>>(new Map());
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [hasMore, setHasMore] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [totalWords, setTotalWords] = useState<number | null>(null);

  // Load total word count on mount
  useEffect(() => {
    const loadTotalCount = async () => {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const count = await getTotalWordCount();
        setTotalWords(count);
      } catch (error) {
        console.error("Error loading total word count:", error);
      }
    };

    void loadTotalCount();
  }, []);

  // Load all words on mount
  useEffect(() => {
    const loadAllWords = async () => {
      if (!isSupabaseConfigured) {
        return;
      }

      setLoading(true);
      try {
        const words = await fetchAllWordsFromSupabase(10);
        setResults(words);
        setHasMore(words.length === 10);
        setIsSearchMode(false);
        setCurrentSearchTerm("");

        // Fetch daily word dates for the results
        if (words.length > 0) {
          const wordIds = words.map((w) => w.id);
          const dates = await fetchDailyWordDates(wordIds);
          setDailyWordDates(dates);
        }
      } catch (error) {
        console.error("Error loading all words:", error);
        setResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    void loadAllWords();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setResults([]);
      setHasMore(false);
      setCurrentSearchTerm("");
      return;
    }

    setLoading(true);
    const trimmedTerm = searchTerm.trim();
    setCurrentSearchTerm(trimmedTerm);
    // If search term is empty, treat it as "show all" (not search mode)
    setIsSearchMode(trimmedTerm.length > 0);
    try {
      // Initially load 10 words
      // If search term is empty, searchWordsFromSupabase will return all words
      const words = await searchWordsFromSupabase(trimmedTerm, 10);
      setResults(words);
      setHasMore(words.length === 10); // If we got 10, there might be more

      // Fetch daily word dates for the results
      if (words.length > 0) {
        const wordIds = words.map((w) => w.id);
        const dates = await fetchDailyWordDates(wordIds);
        setDailyWordDates(dates);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !isSupabaseConfigured) {
      return;
    }

    setLoadingMore(true);
    try {
      let nextBatch: VocabularyWord[];
      
      if (isSearchMode && currentSearchTerm) {
        // Load next batch of search results
        nextBatch = await searchWordsFromSupabase(currentSearchTerm, 10, results.length);
      } else {
        // Load next batch of all words
        nextBatch = await fetchAllWordsFromSupabase(10, results.length);
      }
      
      if (nextBatch.length > 0) {
        setResults((prev) => [...prev, ...nextBatch]);
        setHasMore(nextBatch.length === 10);

        // Fetch daily word dates for new results
        const wordIds = nextBatch.map((w) => w.id);
        const dates = await fetchDailyWordDates(wordIds);
        setDailyWordDates((prev) => {
          const newMap = new Map(prev);
          dates.forEach((date, wordId) => {
            newMap.set(wordId, date);
          });
          return newMap;
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Load more error:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, isSearchMode, currentSearchTerm, results.length]);

  const GUTTER = 16;
  const ITEM_SPACING = 12;
  const CARD_SIDE_PADDING = 12; // Padding on both left and right for cards
  const itemWidth = Math.max(0, (width - GUTTER - CARD_SIDE_PADDING) * 0.9);
  const snapInterval = itemWidth + ITEM_SPACING;
  const contentPadding = GUTTER;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Căutare
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {totalWords !== null && `Cuvinte în vocabular: ${totalWords}`}
              {isSearchMode && currentSearchTerm && ` · Rezultate căutare: ${results.length}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={viewMode === "card" ? "Switch to list view" : "Switch to card view"}
              style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
              onPress={() => setViewMode(viewMode === "card" ? "list" : "card")}
            >
              {viewMode === "card" ? (
                <List size={22} color={theme.colors.iconActive} />
              ) : (
                <Grid3x3 size={22} color={theme.colors.iconActive} />
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Theme"
              style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
              onPress={toggle}
            >
              <ThemeIcon mode={theme.mode} color={theme.colors.iconActive} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.tabBarBg,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            },
          ]}
          placeholder="Caută cuvinte..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable
          style={[
            styles.searchButton,
            {
              backgroundColor: theme.colors.tabActiveBg,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={handleSearch}
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Text style={[styles.searchButtonText, { color: theme.colors.textPrimary }]}>
              Caută
            </Text>
          )}
        </Pressable>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.iconActive} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {isSearchMode ? "Se caută..." : "Se încarcă..."}
          </Text>
        </View>
      ) : results.length > 0 ? (
        viewMode === "card" ? (
          <View style={styles.carouselContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={results}
              keyExtractor={(item) => item.id}
              decelerationRate="fast"
              snapToInterval={snapInterval}
              snapToAlignment="start"
              disableIntervalMomentum
              style={styles.carousel}
              contentContainerStyle={{
                paddingRight: contentPadding,
                paddingBottom: 0,
              }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreCard}>
                    <ActivityIndicator size="small" color={theme.colors.iconActive} />
                  </View>
                ) : null
              }
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: itemWidth,
                    marginRight: index < results.length - 1 ? ITEM_SPACING : 0,
                    height: "100%",
                  }}
                >
                  <Pressable onPress={() => onNavigateToWord?.(item.id)} style={{ flex: 1 }}>
                    <WordCard
                      word={item}
                      dailyWordDate={dailyWordDates.get(item.id)}
                      compact={true}
                    />
                  </Pressable>
                </View>
              )}
              getItemLayout={(_, index) => ({
                length: snapInterval,
                offset: snapInterval * index,
                index,
              })}
            />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={theme.colors.iconActive} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onNavigateToWord?.(item.id)}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: theme.colors.tabBarBg,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <ImageBackground
                  source={{ uri: item.image }}
                  style={styles.listItemImage}
                  imageStyle={styles.listItemImageInner}
                  resizeMode="cover"
                >
                  <View style={styles.listItemImageDarken} />
                  <View style={styles.listItemContent}>
                    <View style={styles.listItemHeader}>
                      <Text style={[styles.listItemTitle, { color: "#FFFFFF" }]}>
                        {item.title}
                      </Text>
                      {dailyWordDates.get(item.id) && (
                        <View style={styles.listItemBadge}>
                          <Text style={styles.listItemBadgeText}>
                            Cuvântul zilei
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.listItemGrammar, { color: "rgba(255, 255, 255, 0.9)" }]}>
                      {item.grammar_block}
                    </Text>
                    <Text
                      style={[styles.listItemDefinition, { color: "rgba(255, 255, 255, 0.85)" }]}
                      numberOfLines={2}
                    >
                      {item.definition}
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>
            )}
          />
        )
      ) : searchTerm.trim() && !loading ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nu s-au găsit rezultate pentru "{searchTerm}"
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  carouselContainer: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  listItem: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    height: 140,
  },
  listItemImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#0F1930",
  },
  listItemImageInner: {
    borderRadius: 16,
  },
  listItemImageDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  listItemContent: {
    padding: 16,
    gap: 8,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listItemTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  listItemBadge: {
    backgroundColor: "rgba(45, 212, 191, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.5)",
  },
  listItemBadgeText: {
    color: "#2DD4BF",
    fontSize: 11,
    fontWeight: "700",
  },
  listItemGrammar: {
    fontSize: 14,
    fontStyle: "italic",
  },
  listItemDefinition: {
    fontSize: 15,
    lineHeight: 20,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingMoreCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    minWidth: 100,
  },
});


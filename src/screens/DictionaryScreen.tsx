import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { VocabularyWord } from "../types";
import { fetchVocabulary, parseVocabulary } from "../api/vocabulary";
import { useTheme } from "../theme/theme";
import { fetchDailyWordDates } from "../api/supabase-words";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { RefreshIcon } from "../components/icons/RefreshIcon";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import { HeartIcon } from "../components/icons/HeartIcon";
import { ShareIcon } from "../components/icons/ShareIcon";
import { InlineRichText } from "../components/InlineRichText";
import { useLikes } from "../hooks/useLikes";
import { shareWord } from "../utils/shareWord";

type Source = "remote" | "local";
type LoadState =
  | { status: "idle" | "loading"; data: VocabularyWord[]; source?: Source; error?: undefined }
  | { status: "ready"; data: VocabularyWord[]; source: Source; error?: undefined }
  | { status: "error"; data: VocabularyWord[]; source?: Source; error: string };

export function DictionaryScreen({
  title,
  subtitle,
  url,
  fallback,
  preloadedWords,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  url: string;
  fallback: unknown;
  preloadedWords?: VocabularyWord[];
  onRefresh?: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme, toggle } = useTheme();
  const listRef = useRef<FlatList<VocabularyWord>>(null);

  const [state, setState] = useState<LoadState>({ status: "idle", data: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyWordDates, setDailyWordDates] = useState<Map<string, string>>(new Map());

  const scrollToStart = useCallback(() => {
    setCurrentIndex(0);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: false, viewPosition: 0 });
    });
  }, []);

  const load = useCallback(async () => {
    console.log(`[${title}] load() called - preloadedWords: ${preloadedWords?.length || 0}, url: "${url}"`);
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    
    // If words are preloaded, use them directly
    if (preloadedWords && preloadedWords.length > 0) {
      console.log(`[${title}] ✅ Using ${preloadedWords.length} preloaded words`);
      setState({ status: "ready", data: shuffle(preloadedWords.slice()), source: "remote" });
      scrollToStart();
      return;
    }
    
    // If preloadedWords is expected but not yet available (empty URL), wait
    // This handles the case where UrbanismeScreen is still loading from Supabase
    // We'll wait for the parent to pass words via the useEffect that watches preloadedWords
    if (preloadedWords === undefined && url === "") {
      console.log(`[${title}] ⏳ No preloaded words yet, waiting for parent to load...`);
      // Keep loading state - the useEffect below will update when preloadedWords arrive
      return;
    }
    
    // Only fetch from URL if URL is provided and not empty
    if (url && url !== "") {
      try {
        console.log(`[${title}] 🌐 Fetching from URL: ${url}`);
        const words = await fetchVocabulary(url);
        setState({ status: "ready", data: shuffle(words.slice()), source: "remote" });
        scrollToStart();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error(`[${title}] ⚠️ URL fetch failed:`, message);
        setState((s) => ({
          status: "error",
          data: s.data,
          error: `Eroare la încărcarea datelor: ${message}`,
        }));
      }
    } else if (!preloadedWords) {
      // No URL and no preloaded words - show error
      console.log(`[${title}] ⚠️ No data source available (no URL, no preloaded words)`);
      setState((s) => ({
        status: "error",
        data: s.data,
        error: "Nu sunt disponibile date",
      }));
    }
  }, [fallback, scrollToStart, url, preloadedWords, title]);

  // Load when component mounts or when preloadedWords changes
  useEffect(() => {
    void load();
  }, [load]);
  
  // Also reload when preloadedWords changes (in case it arrives after initial mount)
  useEffect(() => {
    if (preloadedWords && preloadedWords.length > 0) {
      console.log(`[${title}] Preloaded words received (${preloadedWords.length} words), updating...`);
      const shuffledWords = shuffle(preloadedWords.slice());
      setState({ status: "ready", data: shuffledWords, source: "remote" });
      
      // Fetch daily word dates for preloaded words
      const fetchDates = async () => {
        if (isSupabaseConfigured && supabase) {
          const wordIds = shuffledWords.map((w) => w.id);
          const dates = await fetchDailyWordDates(wordIds);
          setDailyWordDates(dates);
          console.log(`[${title}] Fetched daily word dates for ${dates.size} preloaded words`);
        }
      };
      void fetchDates();
      
      scrollToStart();
    }
  }, [preloadedWords, title, scrollToStart]);

  // Fetch daily word dates when words are loaded
  useEffect(() => {
    if (state.status === "ready" && state.data.length > 0) {
      const fetchDates = async () => {
        if (isSupabaseConfigured && supabase) {
          const wordIds = state.data.map((w) => w.id);
          const dates = await fetchDailyWordDates(wordIds);
          setDailyWordDates(dates);
          console.log(`[${title}] Fetched daily word dates for ${dates.size} words`);
        }
      };
      void fetchDates();
    }
  }, [state.status, state.data, title]);

  // Always start at the beginning to avoid half-snapped initial positions.
  useEffect(() => {
    if (state.data.length === 0) return;
    scrollToStart();
  }, [state.data.length]);

  const header = useMemo(() => {
    const sourceLabel =
      state.source === "local" ? "Local" : state.source === "remote" ? "Online" : "";
    
    // Console.log the source instead of displaying it
    if (sourceLabel) {
      console.log(`[${title}] Source: ${sourceLabel}`);
    }
    
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh"
              style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
              onPress={() => {
                // If parent provides onRefresh callback, use it (for Supabase reloads)
                // Otherwise, use the local load function
                if (onRefresh) {
                  onRefresh();
                } else {
                  load();
                }
              }}
            >
              <RefreshIcon color={theme.colors.iconActive} />
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
        {state.status === "error" ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Eroare la încărcare</Text>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        ) : null}
      </View>
    );
  }, [
    currentIndex,
    load,
    state.data.length,
    state.error,
    state.source,
    state.status,
    theme.colors.headerIconBg,
    theme.colors.iconActive,
    theme.colors.textPrimary,
    theme.colors.textSecondary,
    title,
  ]);

  const isInitialLoading = state.status === "loading" && state.data.length === 0;
  const hasWords = state.data.length > 0;

  const GUTTER = 16;
  const ITEM_SPACING = 12;
  const itemWidth = Math.max(0, width - GUTTER * 2);
  const snapInterval = itemWidth + ITEM_SPACING;
  const contentPadding = Math.max(0, GUTTER - ITEM_SPACING / 2);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isInitialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Se încarcă…
          </Text>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.headerPad}>{header}</View>
          {!hasWords ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Nimic de afișat
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Verifică JSON-ul și conexiunea.
              </Text>
              <Pressable style={styles.retryBtn} onPress={load}>
                <Text style={styles.retryText}>Încarcă</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={state.data}
              keyExtractor={(item) => item.id}
              initialScrollIndex={0}
              decelerationRate="fast"
              snapToInterval={snapInterval}
              snapToAlignment="start"
              disableIntervalMomentum
              style={styles.carousel}
              contentContainerStyle={{
                paddingHorizontal: contentPadding,
                paddingBottom: 0,
              }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: itemWidth,
                    marginHorizontal: ITEM_SPACING / 2,
                    height: "100%",
                  }}
                >
                  <WordCard word={item} dailyWordDate={dailyWordDates.get(item.id)} />
                </View>
              )}
              getItemLayout={(_, index) => ({
                length: snapInterval,
                offset: snapInterval * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = snapInterval > 0 ? Math.round(x / snapInterval) : 0;
                setCurrentIndex(Math.max(0, Math.min(idx, state.data.length - 1)));
              }}
              onScrollToIndexFailed={({ index }) => {
                listRef.current?.scrollToOffset({
                  offset: snapInterval * Math.max(0, index - 1),
                  animated: false,
                });
                requestAnimationFrame(() => {
                  listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
                });
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

function WordCard({ word, dailyWordDate }: { word: VocabularyWord; dailyWordDate?: string | null }) {
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const { isLiked, toggleLike } = useLikes();

  const canScroll = contentH > viewportH + 2;
  const atBottom = scrollY + viewportH >= contentH - 8;
  const liked = isLiked(word.id);

  const examples = useMemo(() => {
    const needles = getHighlightNeedles(word.title);
    return word.examples.map((ex) => highlightExampleHtml(ex, needles));
  }, [word.examples, word.title]);

  const handleShare = useCallback(async () => {
    await shareWord(word);
  }, [word]);

  return (
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: word.image }}
        style={styles.cardImage}
        imageStyle={styles.cardImageInner}
        resizeMode="cover"
      >
        <View style={styles.imageDarken} />
        <ScrollView
          style={styles.overlayScroll}
          contentContainerStyle={styles.overlayContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          scrollEventThrottle={16}
          onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentH(h)}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          stickyHeaderIndices={[0]}
        >
          <View style={styles.stickyHeader}>
            <View style={styles.stickyHeaderRow}>
              <Text style={styles.wordTitle}>{word.title}</Text>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={handleShare}
                  style={styles.shareButton}
                  accessibilityRole="button"
                  accessibilityLabel="Share word"
                >
                  <ShareIcon size={28} color="#EEF3FF" />
                </Pressable>
                <Pressable
                  onPress={() => toggleLike(word.id)}
                  style={styles.heartButton}
                  accessibilityRole="button"
                  accessibilityLabel={liked ? "Unlike word" : "Like word"}
                >
                  <HeartIcon size={28} color={liked ? "#FF6B9D" : "#EEF3FF"} filled={liked} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.grammarBlock}>{word.grammar_block}</Text>
          </View>

          <View style={styles.scrollBody}>
            {dailyWordDate && (
              <View style={styles.dailyWordBadge}>
                <Text style={styles.dailyWordText}>
                  Cuvântul zilei · {formatDailyWordDate(dailyWordDate)}
                </Text>
              </View>
            )}
            <Text style={styles.definition}>{word.definition}</Text>

            <Text style={styles.sectionTitle}>Exemple</Text>
            <View style={styles.examplesWrap}>
              {examples.map((ex, idx) => (
                <View key={`${word.id}-ex-${idx}`} style={styles.exampleRow}>
                  <Text style={styles.exampleIndex}>{idx + 1}.</Text>
                  <InlineRichText text={ex} style={styles.exampleText} />
                </View>
              ))}
            </View>

            <View style={styles.tagRow}>
              {word.tags.map((t) => (
                <View key={`${word.id}-${t}`} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {canScroll && !atBottom ? (
          <View pointerEvents="none" style={styles.scrollHint}>
            <Text style={styles.scrollHintText}>SCROLL</Text>
            <Text style={styles.scrollHintArrow}>⌄</Text>
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shuffle<T>(arr: T[]) {
  // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function getHighlightNeedles(title: string) {
  const needles = new Set<string>();
  const trimmed = title.trim();
  if (trimmed) needles.add(trimmed);

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("a se ")) {
    const base = trimmed.slice(5).trim();
    if (base) needles.add(base);
  } else if (lower.startsWith("a ")) {
    const base = trimmed.slice(2).trim();
    if (base) needles.add(base);
  }

  return Array.from(needles).sort((a, b) => b.length - a.length);
}

function highlightExampleHtml(input: string, needles: string[]) {
  if (needles.length === 0) return input;
  const tokens = input.split(/(<\/?(?:strong|em|b|i)>)/g).filter(Boolean);
  let boldDepth = 0;

  const apply = (text: string) => {
    if (!text) return text;
    let out = text;
    for (const n of needles) {
      const re = new RegExp(
        `(^|[^\\p{L}])(${escapeRegex(n)})(?=[^\\p{L}]|$)`,
        "giu"
      );
      out = out.replace(re, `$1<strong>$2</strong>`);
    }
    return out;
  };

  return tokens
    .map((t) => {
      switch (t) {
        case "<strong>":
        case "<b>":
          boldDepth += 1;
          return t;
        case "</strong>":
        case "</b>":
          boldDepth = Math.max(0, boldDepth - 1);
          return t;
        default:
          return boldDepth > 0 ? t : apply(t);
      }
    })
    .join("");
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, paddingBottom: 6, gap: 12 },
  headerPad: { paddingHorizontal: 16, paddingTop: 12, paddingLeft: 24 },
  carousel: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: {},

  header: { gap: 6 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLeft: { flex: 1, gap: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  errorBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 97, 97, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 97, 97, 0.35)",
    gap: 6,
  },
  errorTitle: { fontWeight: "700", color: "#FFB4B4" },
  errorText: { color: "#FFD1D1", fontSize: 12 },

  emptyBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    gap: 6,
  },
  emptyTitle: { fontWeight: "800", fontSize: 16 },
  emptyText: { fontSize: 12 },
  retryBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#22305C",
  },
  retryText: { color: "#EEF3FF", fontWeight: "700" },

  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginTop: 12,
  },
  cardImage: { flex: 1, width: "100%", backgroundColor: "#0F1930" },
  cardImageInner: { borderRadius: 16 },
  imageDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  overlayScroll: { flex: 1 },
  overlayContent: { paddingBottom: 14, gap: 10 },
  stickyHeader: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  stickyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  shareButton: {
    padding: 4,
    flexShrink: 0,
  },
  heartButton: {
    padding: 4,
    marginRight: -4,
    flexShrink: 0,
  },
  scrollBody: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },

  wordTitle: { fontSize: 54, fontWeight: "900", color: "#EEF3FF", flexShrink: 1 },
  grammarBlock: {
    fontSize: 16,
    fontStyle: "italic",
    color: "rgba(238, 243, 255, 0.92)",
  },
  definition: { fontSize: 26, lineHeight: 34, color: "#E1EAFF" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#EEF3FF",
    marginTop: 14,
  },
  examplesWrap: { gap: 10 },
  exampleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  exampleIndex: {
    fontSize: 18,
    lineHeight: 24,
    color: "rgba(225, 234, 255, 0.95)",
    fontWeight: "900",
  },
  exampleText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: "rgba(225, 234, 255, 0.95)",
  },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(34, 48, 92, 0.80)",
    borderWidth: 1,
    borderColor: "rgba(130, 161, 255, 0.25)",
  },
  tagText: { fontSize: 16, color: "#D8E3FF", fontWeight: "800" },

  scrollHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.78)",
    alignItems: "center",
    gap: 2,
  },
  scrollHintText: {
    color: "rgba(238, 243, 255, 0.95)",
    fontSize: 12,
    fontWeight: "800",
  },
  scrollHintArrow: {
    color: "rgba(238, 243, 255, 0.95)",
    fontSize: 18,
    lineHeight: 18,
  },
  dailyWordBadge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
    marginBottom: 16,
  },
  dailyWordText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
    textAlign: "center",
  },
});

function formatDailyWordDate(dateString: string): string {
  try {
    // Parse YYYY-MM-DD format and create date in local timezone
    // This prevents timezone issues where UTC dates shift to previous day
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}



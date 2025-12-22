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
import { RefreshIcon } from "../components/icons/RefreshIcon";
import { InlineRichText } from "../components/InlineRichText";

type Source = "remote" | "local";
type LoadState =
  | { status: "idle" | "loading"; data: VocabularyWord[]; source?: Source; error?: undefined }
  | { status: "ready"; data: VocabularyWord[]; source: Source; error?: undefined }
  | { status: "error"; data: VocabularyWord[]; source?: Source; error: string };

export function DictionaryScreen({
  title,
  url,
  fallback,
}: {
  title: string;
  url: string;
  fallback: unknown;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const listRef = useRef<FlatList<VocabularyWord>>(null);

  const [state, setState] = useState<LoadState>({ status: "idle", data: [] });
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToStart = useCallback(() => {
    setCurrentIndex(0);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: false, viewPosition: 0 });
    });
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    try {
      const words = await fetchVocabulary(url);
      setState({ status: "ready", data: shuffle(words.slice()), source: "remote" });
      scrollToStart();
    } catch (e) {
      try {
        const localWords = parseVocabulary(fallback);
        setState({ status: "ready", data: shuffle(localWords.slice()), source: "local" });
        scrollToStart();
      } catch (fallbackErr) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const fallbackMessage =
          fallbackErr instanceof Error ? fallbackErr.message : "Unknown error";
        setState((s) => ({
          status: "error",
          data: s.data,
          error: `${message}. Fallback failed: ${fallbackMessage}`,
        }));
      }
    }
  }, [fallback, scrollToStart, url]);

  useEffect(() => {
    void load();
  }, [load]);

  // Always start at the beginning to avoid half-snapped initial positions.
  useEffect(() => {
    if (state.data.length === 0) return;
    scrollToStart();
  }, [state.data.length]);

  const header = useMemo(() => {
    const total = state.data.length;
    const position = total > 0 ? `${currentIndex + 1} / ${total}` : "— / —";
    const sourceLabel =
      state.source === "local" ? "Local" : state.source === "remote" ? "Online" : "";
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {position}
              {sourceLabel ? ` · ${sourceLabel}` : ""}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh"
            style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
            onPress={load}
          >
            <RefreshIcon color={theme.colors.iconActive} />
          </Pressable>
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
                  <WordCard word={item} />
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

function WordCard({ word }: { word: VocabularyWord }) {
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const canScroll = contentH > viewportH + 2;
  const atBottom = scrollY + viewportH >= contentH - 8;

  const examples = useMemo(() => {
    const needles = getHighlightNeedles(word.title);
    return word.examples.map((ex) => highlightExampleHtml(ex, needles));
  }, [word.examples, word.title]);

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
            <Text style={styles.wordTitle}>{word.title}</Text>
            <Text style={styles.grammarBlock}>{word.grammar_block}</Text>
          </View>

          <View style={styles.scrollBody}>
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
  headerPad: { paddingHorizontal: 16 },
  carousel: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: {},

  header: { gap: 6 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLeft: { flex: 1, gap: 2 },
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
  scrollBody: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },

  wordTitle: { fontSize: 54, fontWeight: "900", color: "#EEF3FF" },
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
});



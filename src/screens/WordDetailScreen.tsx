import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchVocabulary, parseVocabulary } from "../api/vocabulary";
import { VOCABULARY_URL } from "../config";
import type { VocabularyWord } from "../types";
import fallbackVocabulary from "../data/fallbackVocabulary.ro.json";
import { useTheme } from "../theme/theme";
import { HeartIcon } from "../components/icons/HeartIcon";
import { InlineRichText } from "../components/InlineRichText";
import { useLikes } from "../hooks/useLikes";
// Highlight functions (copied from VocabularyScreen.tsx)
function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightNeedles(title: string) {
  // Highlight the full title and also a simplified base form for infinitives like:
  // "a miji" -> "miji", "a se furișa" -> "furișa"
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

  // Prefer longer matches first (avoid partial overlaps).
  return Array.from(needles)
    .map((n) => escapeRegex(n))
    .sort((a, b) => b.length - a.length);
}

function highlightExampleHtml(input: string, needles: string[]) {
  if (needles.length === 0) return input;

  // Only operate on text portions outside of <strong>/<em>/<b>/<i> tags,
  // and do not add <strong> inside an existing <strong>.
  const tokens = input.split(/(<\/?(?:strong|em|b|i)>)/g).filter(Boolean);
  let boldDepth = 0;

  const apply = (text: string) => {
    if (!text) return text;
    let out = text;
    for (const n of needles) {
      const re = new RegExp(
        `(^|[^\\p{L}])(${n})(?=[^\\p{L}]|$)`,
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

type LoadState =
  | {
      status: "idle" | "loading";
      data: VocabularyWord[];
      error?: undefined;
    }
  | { status: "ready"; data: VocabularyWord[]; error?: undefined }
  | { status: "error"; data: VocabularyWord[]; error: string };

export function WordDetailScreen({
  wordId,
  onBack,
}: {
  wordId: string;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [state, setState] = useState<LoadState>({
    status: "idle",
    data: [],
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    try {
      const words = await fetchVocabulary(VOCABULARY_URL);
      setState({ status: "ready", data: words, error: undefined });
    } catch (e) {
      // Fallback to bundled JSON if remote isn't reachable / invalid.
      try {
        const localWords = parseVocabulary(fallbackVocabulary as unknown);
        setState({
          status: "ready",
          data: localWords,
          error: undefined,
        });
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const word = useMemo(() => {
    if (state.status !== "ready") return null;
    return state.data.find((w) => w.id === wordId) || null;
  }, [state, wordId]);

  if (state.status === "loading" || state.status === "idle") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.iconActive} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Se încarcă cuvântul…
          </Text>
        </View>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
            Eroare la încărcare
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {state.error}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.colors.iconActive }]}
            onPress={load}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.background }]}>
              Încearcă din nou
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!word) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
            Cuvântul nu a fost găsit
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            ID: {wordId}
          </Text>
        </View>
      </View>
    );
  }

  return <WordCard word={word} onBack={onBack} />;
}

function WordCard({
  word,
  onBack,
}: {
  word: VocabularyWord;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
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
          onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentH(h)}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stickyHeader}>
            <View style={styles.stickyHeaderRow}>
              <Text style={styles.wordTitle}>{word.title}</Text>
              <Pressable
                onPress={() => toggleLike(word.id)}
                style={styles.heartButton}
                accessibilityRole="button"
                accessibilityLabel={liked ? "Unlike word" : "Like word"}
              >
                <HeartIcon size={28} color={liked ? "#FF6B9D" : "#EEF3FF"} filled={liked} />
              </Pressable>
            </View>
            <Text style={styles.grammarBlock}>{word.grammar_block}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.definition}>{word.definition}</Text>

            {word.examples.length > 0 && (
              <View style={styles.examplesSection}>
                <Text style={styles.examplesTitle}>Exemple:</Text>
                {examples.map((html, idx) => (
                  <View key={idx} style={styles.exampleRow}>
                    <Text style={styles.exampleIndex}>{idx + 1}.</Text>
                    <InlineRichText text={html} style={styles.example} />
                  </View>
                ))}
              </View>
            )}

            {word.tags.length > 0 && (
              <View style={styles.tagsSection}>
                {word.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    flex: 1,
    borderRadius: 0,
    overflow: "hidden",
  },
  cardImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  cardImageInner: {
    opacity: 0.85,
  },
  imageDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  overlayScroll: {
    flex: 1,
  },
  overlayContent: {
    padding: 24,
    paddingBottom: 48,
  },
  stickyHeader: {
    marginBottom: 24,
  },
  stickyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wordTitle: {
    fontSize: 54,
    fontWeight: "900",
    color: "#EEF3FF",
    flexShrink: 1,
  },
  grammarBlock: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(238, 243, 255, 0.85)",
    marginTop: 8,
  },
  heartButton: {
    padding: 4,
    marginRight: -4,
    flexShrink: 0,
  },
  content: {
    gap: 20,
  },
  definition: {
    fontSize: 20,
    lineHeight: 28,
    color: "rgba(238, 243, 255, 0.95)",
    fontWeight: "500",
  },
  examplesSection: {
    gap: 12,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(238, 243, 255, 0.95)",
    marginBottom: 4,
  },
  exampleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  exampleIndex: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(238, 243, 255, 0.9)",
    minWidth: 24,
  },
  example: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(238, 243, 255, 0.9)",
    fontStyle: "italic",
  },
  tagsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(238, 243, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(238, 243, 255, 0.25)",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(238, 243, 255, 0.9)",
  },
});


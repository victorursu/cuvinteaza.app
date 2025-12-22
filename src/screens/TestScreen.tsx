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
import { fetchTest, parseTest } from "../api/test";
import { TEST_COUNT, TEST_REVEAL_MS, TEST_URL } from "../config";
import fallbackTest from "../data/fallbackTest.ro.json";
import type { TestDifficulty, TestQuestion } from "../types";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type LoadState =
  | { status: "idle" | "loading"; data: TestQuestion[]; source?: "remote" | "local"; error?: undefined }
  | { status: "ready"; data: TestQuestion[]; source: "remote" | "local"; error?: undefined }
  | { status: "error"; data: TestQuestion[]; source?: "remote" | "local"; error: string };

type AnswerState = {
  [questionId: string]: {
    selectedIndex: number;
    isCorrect: boolean;
  };
};

export function TestScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme, toggle } = useTheme();

  const listRef = useRef<FlatList<TestQuestion>>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<LoadState>({ status: "idle", data: [] });
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectionSeed, setSelectionSeed] = useState(0);
  const [revealLock, setRevealLock] = useState<string | null>(null);
  const [revealEndsAt, setRevealEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  // Drive a simple countdown display when reveal is active.
  useEffect(() => {
    if (!revealEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [revealEndsAt]);

  const remainingSec = useMemo(() => {
    if (!revealEndsAt) return 0;
    const msLeft = Math.max(0, revealEndsAt - now);
    return Math.ceil(msLeft / 1000);
  }, [revealEndsAt, now]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    try {
      const qs = await fetchTest(TEST_URL);
      setState({ status: "ready", data: qs, source: "remote" });
    } catch (e) {
      try {
        const local = parseTest(fallbackTest as unknown);
        setState({ status: "ready", data: local, source: "local" });
      } catch (fallbackErr) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        const fmsg = fallbackErr instanceof Error ? fallbackErr.message : "Unknown error";
        setState((s) => ({ status: "error", data: s.data, error: `${msg}. Fallback failed: ${fmsg}` }));
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = useMemo(() => {
    const all = state.data;
    const n = Math.max(1, TEST_COUNT);
    if (n % 3 !== 0) return [];
    const perTier = n / 3;
    return stratifiedSample(all, { easy: perTier, medium: perTier, hard: perTier });
  }, [state.data, selectionSeed]);

  // Always start at the beginning of the chosen subset.
  useEffect(() => {
    if (questions.length === 0) return;
    requestAnimationFrame(() => {
      setCurrentIndex(0);
      listRef.current?.scrollToIndex({ index: 0, animated: false, viewPosition: 0 });
    });
  }, [questions.length, selectionSeed]);

  const correctCount = useMemo(() => {
    let c = 0;
    for (const q of questions) {
      if (answers[q.id]?.isCorrect) c += 1;
    }
    return c;
  }, [answers, questions]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const stats = useMemo(() => {
    const byDiff: Record<TestDifficulty, { total: number; correct: number }> = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    };
    let points = 0;
    for (const q of questions) {
      byDiff[q.difficulty].total += 1;
      const isCorrect = Boolean(answers[q.id]?.isCorrect);
      if (isCorrect) {
        byDiff[q.difficulty].correct += 1;
        points += difficultyWeight(q.difficulty);
      }
    }
    const maxPoints =
      byDiff.easy.total * 1 + byDiff.medium.total * 2 + byDiff.hard.total * 3;
    const acc = (d: TestDifficulty) =>
      byDiff[d].total > 0 ? byDiff[d].correct / byDiff[d].total : 0;

    return {
      byDiff,
      points,
      maxPoints,
      accEasy: acc("easy"),
      accMedium: acc("medium"),
      accHard: acc("hard"),
    };
  }, [answers, questions]);

  const level = useMemo(() => classify(stats), [stats]);

  const reset = useCallback(() => {
    clearRevealTimer();
    setAnswers({});
    setFinished(false);
    setCurrentIndex(0);
    setRevealLock(null);
    setRevealEndsAt(null);
    setSelectionSeed((s) => s + 1);

    // Ensure we visually jump back to the first card.
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: false, viewPosition: 0 });
    });
  }, [clearRevealTimer]);

  const advanceTo = useCallback(
    (index: number) => {
      setRevealLock(null);
      setRevealEndsAt(null);
      setCurrentIndex(index);
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    },
    []
  );

  const finishNow = useCallback(() => {
    setRevealLock(null);
    setRevealEndsAt(null);
    setFinished(true);
  }, []);

  const header = useMemo(() => {
    const position = total > 0 ? `${Math.min(currentIndex + 1, total)} / ${total}` : "— / —";
    const sourceLabel = state.source === "local" ? "Local" : state.source === "remote" ? "Online" : "";
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Testare</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {position}
              {sourceLabel ? ` · ${sourceLabel}` : ""}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Theme"
              style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
              onPress={toggle}
            >
              <ThemeIcon mode={theme.mode} color={theme.colors.iconActive} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Restart"
              style={[styles.smallBtn, { backgroundColor: theme.colors.headerIconBg }]}
              onPress={reset}
            >
              <Text style={[styles.smallBtnText, { color: theme.colors.iconActive }]}>Reset</Text>
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
  }, [currentIndex, total, state.source, state.status, state.error, theme, reset]);

  const isInitialLoading = state.status === "loading" && state.data.length === 0;

  const GUTTER = 16;
  const ITEM_SPACING = 12;
  const itemWidth = Math.max(0, width - GUTTER * 2);
  const snapInterval = itemWidth + ITEM_SPACING;
  const contentPadding = Math.max(0, GUTTER - ITEM_SPACING / 2);

  if (isInitialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Se încarcă testul…
          </Text>
        </View>
      </View>
    );
  }

  if (finished) {
    const levelColors = getLevelColors(level, theme.mode);
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerPad}>{header}</View>
        <View style={styles.resultBox}>
          <DonutHero
            percent={pct}
            level={level}
            colors={levelColors}
            textColor={theme.colors.textPrimary}
          />

          <View style={styles.statsRow}>
            <StatCard
              label="Puncte"
              value={`${stats.points} / ${stats.maxPoints}`}
              icon="🎯"
              textColor={theme.colors.textPrimary}
              subColor={theme.colors.textSecondary}
              borderColor={theme.colors.border}
            />
            <StatCard
              label="Corecte"
              value={`${correctCount} / ${total}`}
              icon="✅"
              textColor={theme.colors.textPrimary}
              subColor={theme.colors.textSecondary}
              borderColor={theme.colors.border}
            />
          </View>

          <View style={styles.breakdown}>
            <Text style={[styles.breakdownTitle, { color: theme.colors.textPrimary }]}>
              Dificultate
            </Text>
            <View style={styles.breakdownRow}>
              <MiniDonut
                label="Easy"
                percent={Math.round(stats.accEasy * 100)}
                color={levelColors.mini1}
                track={levelColors.track}
                textColor={theme.colors.textPrimary}
                subColor={theme.colors.textSecondary}
              />
              <MiniDonut
                label="Medium"
                percent={Math.round(stats.accMedium * 100)}
                color={levelColors.mini2}
                track={levelColors.track}
                textColor={theme.colors.textPrimary}
                subColor={theme.colors.textSecondary}
              />
              <MiniDonut
                label="Hard"
                percent={Math.round(stats.accHard * 100)}
                color={levelColors.mini3}
                track={levelColors.track}
                textColor={theme.colors.textPrimary}
                subColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <Pressable
            style={[styles.primaryBtn, { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border }]}
            onPress={reset}
          >
            <Text style={[styles.primaryBtnText, { color: theme.colors.textPrimary }]}>Reîncepe</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.body}>
        <View style={styles.headerPad}>{header}</View>
        {questions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              Test invalid
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Ai nevoie de {TEST_COUNT} întrebări împărțite egal pe dificultăți (easy/medium/hard).
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
            data={questions}
            keyExtractor={(q) => q.id}
            scrollEnabled={revealLock === null}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            snapToAlignment="start"
            disableIntervalMomentum
            style={styles.carousel}
            contentContainerStyle={{
              paddingHorizontal: contentPadding,
              paddingBottom: 0,
            }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: itemWidth,
                  marginHorizontal: ITEM_SPACING / 2,
                  height: "100%",
                }}
              >
                <QuestionCard
                  question={item}
                  answered={answers[item.id]}
                  isLast={index === questions.length - 1}
                  onAnswer={(selectedIndex) => {
                    if (answers[item.id]) return;
                    const isCorrect = item.correct_options.includes(selectedIndex);
                    setRevealLock(item.id);
                    setRevealEndsAt(Date.now() + TEST_REVEAL_MS);
                    setAnswers((a) => ({
                      ...a,
                      [item.id]: { selectedIndex, isCorrect },
                    }));

                    // Wait a couple seconds so the user can reflect on the answer,
                    // then auto-advance (or show result if this was the last question).
                    clearRevealTimer();
                    revealTimerRef.current = setTimeout(() => {
                      const next = Math.min(index + 1, questions.length - 1);
                      if (next !== index) {
                        advanceTo(next);
                      } else {
                        finishNow();
                      }
                    }, TEST_REVEAL_MS);
                  }}
                  onNext={() => {
                    clearRevealTimer();
                    setRevealEndsAt(null);
                    const next = Math.min(index + 1, questions.length - 1);
                    if (next !== index) advanceTo(next);
                    else finishNow();
                  }}
                  remainingSec={revealLock === item.id ? remainingSec : 0}
                  progress={{
                    current: Math.min(currentIndex + 1, total),
                    total,
                    answeredCount,
                  }}
                />
              </View>
            )}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = snapInterval > 0 ? Math.round(x / snapInterval) : 0;
              setCurrentIndex(Math.max(0, Math.min(idx, questions.length - 1)));
            }}
            onScrollToIndexFailed={({ index }) => {
              listRef.current?.scrollToOffset({
                offset: snapInterval * Math.max(0, index - 1),
                animated: false,
              });
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
              });
            }}
          />
        )}
      </View>
    </View>
  );
}

function QuestionCard({
  question,
  answered,
  isLast,
  onAnswer,
  onNext,
  remainingSec,
  progress,
}: {
  question: TestQuestion;
  answered?: { selectedIndex: number; isCorrect: boolean };
  isLast: boolean;
  onAnswer: (selectedIndex: number) => void;
  onNext: () => void;
  remainingSec: number;
  progress: { current: number; total: number; answeredCount: number };
}) {
  const { theme } = useTheme();
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const canScroll = contentH > viewportH + 2;
  const atBottom = scrollY + viewportH >= contentH - 8;

  return (
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: question.image }}
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
        >
          <View style={styles.stickyHeader}>
            <Text style={[styles.questionTitle, { color: theme.colors.textPrimary }]}>
              {question.question}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {question.difficulty.toUpperCase()} · {progress.current}/{progress.total}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${
                      progress.total > 0
                        ? Math.round((progress.answeredCount / progress.total) * 100)
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.scrollBody}>
            <View style={styles.optionsWrap}>
              {question.options.map((opt, idx) => {
                const isSelected = answered?.selectedIndex === idx;
                const isCorrect = question.correct_options.includes(idx);
                const showResult = Boolean(answered);

                let bg = "rgba(255,255,255,0.08)";
                let border = "rgba(255,255,255,0.14)";
                if (showResult && isCorrect) {
                  bg = "rgba(45, 212, 191, 0.20)";
                  border = "rgba(45, 212, 191, 0.55)";
                } else if (showResult && isSelected && !isCorrect) {
                  bg = "rgba(255, 97, 97, 0.20)";
                  border = "rgba(255, 97, 97, 0.55)";
                } else if (isSelected) {
                  bg = "rgba(130, 161, 255, 0.18)";
                  border = "rgba(130, 161, 255, 0.50)";
                }

                return (
                  <Pressable
                    key={`${question.id}-opt-${idx}`}
                    onPress={() => onAnswer(idx)}
                    disabled={Boolean(answered)}
                    style={({ pressed }) => [
                      styles.optionBtn,
                      { backgroundColor: bg, borderColor: border },
                      pressed && !answered ? { opacity: 0.85 } : null,
                    ]}
                  >
                    <Text style={styles.optionIndex}>{String.fromCharCode(65 + idx)}</Text>
                    <Text style={styles.optionText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>

            {answered ? (
              <Pressable
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: theme.colors.tabActiveBg,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onNext}
              >
                <Text style={[styles.primaryBtnText, { color: theme.colors.textPrimary }]}>
                  {isLast ? "Rezultat" : "Următoarea"}
                  {remainingSec > 0 ? ` în ${remainingSec}s.` : ""}
                </Text>
              </Pressable>
            ) : null}
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
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  smallBtnText: { fontWeight: "900", fontSize: 12 },
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
    marginHorizontal: 16,
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
    backgroundColor: "rgba(0,0,0,0.70)",
  },
  overlayScroll: { flex: 1 },
  overlayContent: { paddingBottom: 14 },
  stickyHeader: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
    gap: 10,
  },
  questionTitle: { fontSize: 28, fontWeight: "900" },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(130, 161, 255, 0.75)",
  },
  scrollBody: { paddingHorizontal: 14, paddingTop: 12, gap: 14 },
  optionsWrap: { gap: 12 },
  optionBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  optionIndex: {
    width: 26,
    height: 26,
    borderRadius: 8,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "900",
    color: "#EEF3FF",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  optionText: { flex: 1, fontSize: 18, lineHeight: 24, color: "rgba(225, 234, 255, 0.95)", fontWeight: "700" },
  primaryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 16, fontWeight: "900" },
  resultBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  statsRow: { flexDirection: "row", gap: 12, width: "100%" },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 6,
  },
  statTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  statIcon: { fontSize: 16 },
  statLabel: { fontSize: 12, fontWeight: "900" },
  statValue: { fontSize: 18, fontWeight: "900" },
  breakdown: { width: "100%", gap: 10, marginTop: 6 },
  breakdownTitle: { fontSize: 14, fontWeight: "900" },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  miniWrap: { width: "32%", alignItems: "center", gap: 6 },
  miniLabel: { fontSize: 12, fontWeight: "900" },
  miniPct: { fontSize: 12, fontWeight: "900" },
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

function clampPct(p: number) {
  if (Number.isNaN(p)) return 0;
  return Math.max(0, Math.min(100, p));
}

function DonutHero({
  percent,
  level,
  colors,
  textColor,
}: {
  percent: number;
  level: string;
  colors: {
    track: string;
    fill: string;
    gradId: string;
    gradStops: Array<{ offset: string; color: string }>;
  };
  textColor: string;
}) {
  const p = clampPct(percent);
  const size = 220;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const gap = c - dash;

  return (
    <View style={heroStyles.wrap}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={colors.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {colors.gradStops.map((s) => (
              <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${colors.gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View pointerEvents="none" style={heroStyles.center}>
        <Text style={[heroStyles.pct, { color: textColor }]}>{p}%</Text>
        <Text style={[heroStyles.level, { color: textColor }]}>{level}</Text>
      </View>
    </View>
  );
}

function MiniDonut({
  label,
  percent,
  color,
  track,
  textColor,
  subColor,
}: {
  label: string;
  percent: number;
  color: string;
  track: string;
  textColor: string;
  subColor: string;
}) {
  const p = clampPct(percent);
  const size = 86;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const gap = c - dash;

  return (
    <View style={styles.miniWrap}>
      <Text style={[styles.miniLabel, { color: subColor }]}>{label}</Text>
      <View>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={track}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View pointerEvents="none" style={miniStyles.center}>
          <Text style={[styles.miniPct, { color: textColor }]}>{p}%</Text>
        </View>
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  textColor,
  subColor,
  borderColor,
}: {
  label: string;
  value: string;
  icon: string;
  textColor: string;
  subColor: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor }]}>
      <View style={styles.statTop}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statLabel, { color: subColor }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function getLevelColors(level: string, mode: "dark" | "light") {
  const track = mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(11,18,32,0.12)";

  if (level === "Expert") {
    return {
      track,
      fill: "#10B981",
      gradId: "grad-expert",
      gradStops: [
        { offset: "0%", color: "#10B981" }, // emerald
        { offset: "100%", color: "#8B5CF6" }, // purple
      ],
      mini1: "rgba(16,185,129,0.90)",
      mini2: "rgba(16,185,129,0.70)",
      mini3: "rgba(16,185,129,0.55)",
    };
  }

  if (level === "Intermediate") {
    return {
      track,
      fill: "#3B82F6",
      gradId: "grad-intermediate",
      gradStops: [
        { offset: "0%", color: "#60A5FA" },
        { offset: "100%", color: "#2563EB" },
      ],
      mini1: "rgba(59,130,246,0.90)",
      mini2: "rgba(59,130,246,0.70)",
      mini3: "rgba(59,130,246,0.55)",
    };
  }

  // Beginner
  return {
    track,
    fill: "#94A3B8",
    gradId: "grad-beginner",
    gradStops: [
      { offset: "0%", color: "#A5B4FC" },
      { offset: "100%", color: "#94A3B8" },
    ],
    mini1: "rgba(148,163,184,0.90)",
    mini2: "rgba(148,163,184,0.70)",
    mini3: "rgba(148,163,184,0.55)",
  };
}

const heroStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pct: { fontSize: 56, fontWeight: "900" },
  level: { fontSize: 18, fontWeight: "900", opacity: 0.95 },
});

const miniStyles = StyleSheet.create({
  center: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

function difficultyWeight(d: TestDifficulty) {
  if (d === "easy") return 1;
  if (d === "medium") return 2;
  return 3;
}

function stratifiedSample(
  all: TestQuestion[],
  counts: { easy: number; medium: number; hard: number }
) {
  const by: Record<TestDifficulty, TestQuestion[]> = {
    easy: [],
    medium: [],
    hard: [],
  };
  for (const q of all) by[q.difficulty].push(q);
  if (
    by.easy.length < counts.easy ||
    by.medium.length < counts.medium ||
    by.hard.length < counts.hard
  ) {
    return [];
  }
  const pick = (d: TestDifficulty, n: number) => shuffle(by[d].slice()).slice(0, n);
  return shuffle([
    ...pick("easy", counts.easy),
    ...pick("medium", counts.medium),
    ...pick("hard", counts.hard),
  ]);
}

function classify(stats: {
  points: number;
  accEasy: number;
  accMedium: number;
  accHard: number;
}) {
  const easy = stats.accEasy;
  const med = stats.accMedium;
  const hard = stats.accHard;
  const total = stats.points;

  // Gates
  const passEasy70 = easy >= 0.7;
  const passMed50 = med >= 0.5;
  const passHard40 = hard >= 0.4;

  // Beginner
  if (!passEasy70) return "Beginner";
  if (med < 0.5 || total < 25) return "Beginner";

  // Intermediate
  if (easy >= 0.8 && passMed50 && hard < 0.4 && total >= 25 && total <= 45) {
    return "Intermediate";
  }

  // Expert
  if (easy >= 0.9 && med >= 0.7 && passHard40 && total >= 46) {
    return "Expert";
  }

  // If gates fail, cap level
  if (!passMed50) return "Beginner";
  if (!passHard40) return "Intermediate";
  return "Intermediate";
}



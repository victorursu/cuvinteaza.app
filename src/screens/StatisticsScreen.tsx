import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import { fetchStatistics } from "../api/supabase-statistics";
import type { Statistics } from "../api/supabase-statistics";
import { isSupabaseConfigured } from "../lib/supabase";
import { MedalIcon } from "../components/icons/MedalIcon";
import { HeartIcon } from "../components/icons/HeartIcon";

// Cache for statistics (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CachedStatistics {
  data: Statistics;
  timestamp: number;
}

// Global cache (persists across component remounts)
let statisticsCache: CachedStatistics | null = null;


export function StatisticsScreen({
  onNavigateToWord,
}: {
  onNavigateToWord?: (wordId: string) => void;
}) {
  const { theme, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!isSupabaseConfigured) {
        setError("Supabase nu este configurat");
        setLoading(false);
        return;
      }

      // Check if we have valid cached data
      const now = Date.now();
      if (
        statisticsCache &&
        now - statisticsCache.timestamp < CACHE_DURATION
      ) {
        // Use cached data
        setStats(statisticsCache.data);
        setError(null);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      try {
        const data = await fetchStatistics();
        // Update cache
        statisticsCache = {
          data,
          timestamp: now,
        };
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la încărcare");
        // If we have stale cache, use it as fallback
        if (statisticsCache) {
          setStats(statisticsCache.data);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Statistici
          </Text>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.iconActive} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Se încarcă statisticile...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top 3 Liked Words */}
          <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              Cele mai îndrăgite cuvinte
            </Text>
            {stats?.topLikedWords && stats.topLikedWords.length > 0 ? (
              <View style={styles.topWordsList}>
                {stats.topLikedWords.slice(0, 3).map((item) => {
                  const medalType = item.rank === 1 ? "gold" : item.rank === 2 ? "silver" : "bronze";
                  return (
                    <Pressable
                      key={item.word.id}
                      onPress={() => onNavigateToWord?.(item.word.id)}
                      style={[
                        styles.wordCard,
                        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                      ]}
                    >
                      <ImageBackground
                        source={{ uri: item.word.image }}
                        style={styles.cardImage}
                        imageStyle={styles.cardImageInner}
                        resizeMode="cover"
                      >
                        <View style={styles.imageDarken} />
                        <View style={styles.cardContent}>
                          <View style={styles.cardHeader}>
                            <MedalIcon type={medalType} size={40} />
                            <View style={styles.cardHeaderRight}>
                              <View style={styles.titleRow}>
                                <Text style={[styles.wordTitle, { color: theme.colors.textPrimary }]}>
                                  {item.word.title}
                                </Text>
                                <View style={styles.likesContainer}>
                                  <HeartIcon size={18} color="#FF6B9D" filled />
                                  <Text style={[styles.likesText, { color: theme.colors.textPrimary }]}>
                                    {item.likes}
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.wordGrammar, { color: theme.colors.textSecondary }]}>
                                {item.word.grammar_block}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </ImageBackground>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Nu există date disponibile
              </Text>
            )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Utilizatori"
              value={stats?.totalUsers || 0}
              theme={theme}
            />
            <StatCard
              title="Utilizatori Activi"
              value={stats?.activeUsers || 0}
              theme={theme}
            />
            <StatCard
              title="Cuvinte în Baza de Date"
              value={stats?.totalWords || 0}
              theme={theme}
            />
            <StatCard
              title="Tag-uri Distincte"
              value={stats?.distinctTags || 0}
              theme={theme}
            />
            <StatCard
              title="Regionalisme"
              value={stats?.regionalismeWords || 0}
              theme={theme}
            />
            <StatCard
              title="Urbanisme"
              value={stats?.urbanismeWords || 0}
              theme={theme}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({
  title,
  value,
  theme,
}: {
  title: string;
  value: number;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
        {value.toLocaleString()}
      </Text>
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
  title: {
    fontSize: 28,
    fontWeight: "900",
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  topWordsList: {
    gap: 12,
  },
  wordTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  wordCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
  },
  cardImage: {
    width: "100%",
    minHeight: 100,
    backgroundColor: "#0F1930",
  },
  cardImageInner: {
    borderRadius: 16,
  },
  imageDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderRight: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wordGrammar: {
    fontSize: 12,
    fontStyle: "italic",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  likesText: {
    fontSize: 16,
    fontWeight: "700",
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
  },
});


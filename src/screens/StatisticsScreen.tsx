import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import { fetchStatistics } from "../api/supabase-statistics";
import type { Statistics } from "../api/supabase-statistics";
import { isSupabaseConfigured } from "../lib/supabase";

// Cache for statistics (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CachedStatistics {
  data: Statistics;
  timestamp: number;
}

// Global cache (persists across component remounts)
let statisticsCache: CachedStatistics | null = null;

const MEDAL_COLORS = {
  1: "#FFD700", // Gold
  2: "#C0C0C0", // Silver
  3: "#CD7F32", // Bronze
};

export function StatisticsScreen() {
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
          {/* Top 5 Liked Words */}
          <View style={[styles.card, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              Top 5 Cuvinte Preferate
            </Text>
            {stats?.topLikedWords && stats.topLikedWords.length > 0 ? (
              <View style={styles.topWordsList}>
                {stats.topLikedWords.map((item) => (
                  <View
                    key={item.word.id}
                    style={[
                      styles.topWordItem,
                      { backgroundColor: theme.colors.background },
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {item.rank <= 3 ? (
                        <View
                          style={[
                            styles.medal,
                            { backgroundColor: MEDAL_COLORS[item.rank as 1 | 2 | 3] },
                          ]}
                        >
                          <Text style={styles.medalText}>{item.rank}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.rankText, { color: theme.colors.textSecondary }]}>
                          {item.rank}.
                        </Text>
                      )}
                    </View>
                    <View style={styles.wordInfo}>
                      <Text style={[styles.wordTitle, { color: theme.colors.textPrimary }]}>
                        {item.word.title}
                      </Text>
                      <Text style={[styles.wordLikes, { color: theme.colors.textSecondary }]}>
                        {item.likes} {item.likes === 1 ? "like" : "likes"}
                      </Text>
                    </View>
                  </View>
                ))}
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
    <View style={[styles.statCard, { backgroundColor: theme.colors.cardBg }]}>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
        {title}
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
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  topWordsList: {
    gap: 12,
  },
  topWordItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  medal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  medalText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
  },
  wordInfo: {
    flex: 1,
    gap: 4,
  },
  wordTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  wordLikes: {
    fontSize: 12,
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
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});


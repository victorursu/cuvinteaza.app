import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useTheme } from "../theme/theme";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";

type TestResult = {
  id: string;
  created_at: string;
  final_percentage: number;
  final_calculated_level: string;
};

export function TestTimeline({
  session,
  onNavigateToTest,
}: {
  session: Session;
  onNavigateToTest?: () => void;
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const loadTestResults = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cuvinteziTeste")
          .select("id, created_at, final_percentage, final_calculated_level")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load test results:", error);
          setTestResults([]);
        } else {
          setTestResults(data || []);
        }
      } catch (error) {
        console.error("Failed to load test results:", error);
        setTestResults([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTestResults();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.iconActive} />
      </View>
    );
  }

  if (testResults.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Nu există rezultate de teste încă
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.tabBarBg }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Evoluția scorurilor · Test general
      </Text>
      {onNavigateToTest && (
        <Pressable
          style={[styles.testButton, { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border }]}
          onPress={onNavigateToTest}
        >
          <Text style={[styles.testButtonText, { color: theme.colors.textPrimary }]}>
            Începe testul
          </Text>
        </Pressable>
      )}
      <TestGraph
        results={testResults}
        width={width - 48}
        theme={theme}
      />
    </View>
  );
}

function TestGraph({
  results,
  width,
  theme,
}: {
  results: TestResult[];
  width: number;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const graphHeight = 200;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const chartHeight = graphHeight - padding * 2;

  // Calculate min/max for scaling
  const percentages = results.map((r) => r.final_percentage);
  const minPercent = Math.max(0, Math.min(...percentages) - 10);
  const maxPercent = Math.min(100, Math.max(...percentages) + 10);
  const range = maxPercent - minPercent || 1;

  // Calculate points for the line
  const points = results.map((result, index) => {
    const x = padding + (index / (results.length - 1 || 1)) * graphWidth;
    const y =
      padding +
      chartHeight -
      ((result.final_percentage - minPercent) / range) * chartHeight;
    return { x, y, result };
  });

  // Create polyline path
  const pathData = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Format dates for x-axis labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.graphWrapper}>
      <View style={styles.graphContainer}>
        <Svg width={width} height={graphHeight}>
          {/* Y-axis (vertical line on the left) */}
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={graphHeight - padding}
            stroke={theme.colors.textPrimary}
            strokeWidth={2}
            opacity={0.6}
          />

          {/* X-axis (horizontal line at the bottom) */}
          <Line
            x1={padding}
            y1={graphHeight - padding}
            x2={width - padding}
            y2={graphHeight - padding}
            stroke={theme.colors.textPrimary}
            strokeWidth={2}
            opacity={0.6}
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y =
              padding +
              chartHeight -
              ((percent - minPercent) / range) * chartHeight;
            return (
              <Line
                key={percent}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={theme.colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.3}
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y =
              padding +
              chartHeight -
              ((percent - minPercent) / range) * chartHeight;
            return (
              <SvgText
                key={percent}
                x={padding - 12}
                y={y + 5}
                fontSize="10"
                fontWeight="700"
                fill={theme.colors.textPrimary}
                textAnchor="end"
              >
                {percent}%
              </SvgText>
            );
          })}

          {/* Line graph */}
          {points.length > 1 && (
            <Polyline
              points={pathData}
              fill="none"
              stroke={theme.colors.iconActive}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point) => (
            <Circle
              key={point.result.id}
              cx={point.x}
              cy={point.y}
              r={6}
              fill={theme.colors.iconActive}
              stroke={theme.colors.background}
              strokeWidth={2}
            />
          ))}

          {/* X-axis labels (dates) */}
          {results.map((result, index) => {
            const x = padding + (index / (results.length - 1 || 1)) * graphWidth;
            return (
              <SvgText
                key={result.id}
                x={x}
                y={graphHeight - padding + 22}
                fontSize="9"
                fontWeight="100"
                fill={theme.colors.textPrimary}
                textAnchor="middle"
              >
                {formatDate(result.created_at)}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend/Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Primul test
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {Math.round(results[0]?.final_percentage || 0)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Ultimul test
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {Math.round(results[results.length - 1]?.final_percentage || 0)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total teste
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {results.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  testButton: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  graphWrapper: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  graphContainer: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});


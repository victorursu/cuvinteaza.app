import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useTheme } from "../theme/theme";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type TestResult = {
  final_percentage: number;
  final_calculated_level: string;
  easy_percentage: number;
  medium_percentage: number;
  hard_percentage: number;
  points: number;
  max_points: number;
  correct_answers: number;
  max_correct_answers: number;
};

export function LastTestResults({ session }: { session: Session }) {
  const { theme } = useTheme();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const loadLastTestResult = async () => {
      try {
        const { data, error } = await supabase
          .from("cuvinteziTeste")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" - that's okay
          console.error("Failed to load test result:", error);
          setTestResult(null);
        } else if (data) {
          setTestResult(data);
        } else {
          setTestResult(null);
        }
      } catch (error) {
        console.error("Failed to load test result:", error);
        setTestResult(null);
      } finally {
        setLoading(false);
      }
    };

    void loadLastTestResult();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.iconActive} />
      </View>
    );
  }

  if (!testResult) {
    return null; // Don't show anything if no test results
  }

  const levelMap: Record<string, string> = {
    beginner: "Începător",
    intermediate: "Intermediar",
    advanced: "Avansat",
  };

  const displayLevel = levelMap[testResult.final_calculated_level] || testResult.final_calculated_level;
  const levelColors = getLevelColors(testResult.final_calculated_level, theme.mode);

  return (
    <View style={styles.container}>
      <View style={styles.resultsContainer}>
        {/* Main Donut Chart */}
        <DonutHero
          percent={testResult.final_percentage}
          level={displayLevel}
          colors={levelColors}
          textColor={theme.colors.textPrimary}
        />

        {/* Mini Donuts Row */}
        <View style={styles.miniDonutsRow}>
          <MiniDonut
            label="Ușor"
            percent={testResult.easy_percentage}
            color={levelColors.mini1}
            track={levelColors.track}
            textColor={theme.colors.textPrimary}
            subColor={theme.colors.textSecondary}
          />
          <MiniDonut
            label="Mediu"
            percent={testResult.medium_percentage}
            color={levelColors.mini2}
            track={levelColors.track}
            textColor={theme.colors.textPrimary}
            subColor={theme.colors.textSecondary}
          />
          <MiniDonut
            label="Greu"
            percent={testResult.hard_percentage}
            color={levelColors.mini3}
            track={levelColors.track}
            textColor={theme.colors.textPrimary}
            subColor={theme.colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );
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
  const p = Math.max(0, Math.min(100, percent));
  const size = 180;
  const stroke = 16;
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
        <Text style={[heroStyles.pct, { color: textColor }]}>{Math.round(p)}%</Text>
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
  const p = Math.max(0, Math.min(100, percent));
  const size = 80;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const gap = c - dash;

  return (
    <View style={miniStyles.wrap}>
      <View style={{ width: size, height: size, position: "relative" }}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
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
          <Text style={[miniStyles.pct, { color: textColor }]}>{Math.round(p)}%</Text>
        </View>
      </View>
      <Text style={[miniStyles.label, { color: subColor }]}>{label}</Text>
    </View>
  );
}


function getLevelColors(level: string, mode: "dark" | "light") {
  const track = mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(11,18,32,0.12)";

  if (level === "advanced") {
    return {
      track,
      fill: "#10B981",
      gradId: "grad-expert-account",
      gradStops: [
        { offset: "0%", color: "#10B981" },
        { offset: "100%", color: "#8B5CF6" },
      ],
      mini1: "rgba(16,185,129,0.90)",
      mini2: "rgba(16,185,129,0.70)",
      mini3: "rgba(16,185,129,0.55)",
    };
  }

  if (level === "intermediate") {
    return {
      track,
      fill: "#3B82F6",
      gradId: "grad-intermediate-account",
      gradStops: [
        { offset: "0%", color: "#60A5FA" },
        { offset: "100%", color: "#2563EB" },
      ],
      mini1: "rgba(59,130,246,0.90)",
      mini2: "rgba(59,130,246,0.70)",
      mini3: "rgba(59,130,246,0.55)",
    };
  }

  // beginner
  return {
    track,
    fill: "#94A3B8",
    gradId: "grad-beginner-account",
    gradStops: [
      { offset: "0%", color: "#A5B4FC" },
      { offset: "100%", color: "#94A3B8" },
    ],
    mini1: "rgba(148,163,184,0.90)",
    mini2: "rgba(148,163,184,0.70)",
    mini3: "rgba(148,163,184,0.55)",
  };
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  resultsContainer: {
    alignItems: "center",
    gap: 24,
  },
  miniDonutsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },
});

const heroStyles = StyleSheet.create({
  wrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pct: {
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 50,
  },
  level: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
});

const miniStyles = StyleSheet.create({
  wrap: {
    width: 80,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  pct: {
    fontSize: 16,
    fontWeight: "800",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});



import type { Animated as AnimatedType } from "react-native";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme";

export function BootSplash({ progress }: { progress: AnimatedType.Value }) {
  const { theme } = useTheme();
  const brandColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.textSecondary, "#8B5CF6"],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.brandWrap}>
        <Animated.Text style={[styles.brand, { color: brandColor }]}>
          Cuvinteaza.ro
        </Animated.Text>
      </View>

      <View style={styles.loaderRow}>
        <ActivityIndicator />
        <Animated.Text style={[styles.loading, { color: theme.colors.textSecondary }]}>
          Se încarcă…
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 22,
  },
  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 34, fontWeight: "900" },
  loaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  loading: { fontSize: 13, fontWeight: "800" },
});



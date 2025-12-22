import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";

export function PlaceholderScreen({ title }: { title: string }) {
  const { theme, toggle } = useTheme();
  const insets = useSafeAreaInsets();
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
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
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
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 8,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 28, fontWeight: "900", flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});



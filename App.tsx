import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs, type TabKey } from "./src/components/BottomTabs";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { VocabularyScreen } from "./src/screens/VocabularyScreen";
import { ThemeProvider, useTheme } from "./src/theme/theme";

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const [tab, setTab] = useState<TabKey>("cuvinte");
  const { theme } = useTheme();

  const screen = useMemo(() => {
    switch (tab) {
      case "account":
        return <PlaceholderScreen title="Account" />;
      case "regionalisme":
        return <PlaceholderScreen title="Regionalisme" />;
      case "urbanisme":
        return <PlaceholderScreen title="Urbanisme" />;
      case "setari":
        return <PlaceholderScreen title="Setari" />;
      case "cuvinte":
      default:
        return <VocabularyScreen />;
    }
  }, [tab]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
        <View style={styles.content}>{screen}</View>
        <BottomTabs active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});

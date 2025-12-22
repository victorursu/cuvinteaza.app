import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs, type TabKey } from "./src/components/BottomTabs";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { VocabularyScreen } from "./src/screens/VocabularyScreen";
import { ThemeProvider, useTheme } from "./src/theme/theme";
import { TestScreen } from "./src/screens/TestScreen";
import { RegionalismeScreen } from "./src/screens/RegionalismeScreen";
import { UrbanismeScreen } from "./src/screens/UrbanismeScreen";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { BootSplash } from "./src/screens/BootSplash";

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
  const [appReady, setAppReady] = useState(false);
  const bootProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Prevent native splash from auto-hiding; we'll hide it ourselves once React UI is ready.
    SplashScreen.preventAutoHideAsync().catch(() => {
      // no-op (Expo Go can sometimes throw if called multiple times during fast refresh)
    });
  }, []);

  useEffect(() => {
    const BOOT_MS = 4000;
    let cancelled = false;
    let anim: Animated.CompositeAnimation | null = null;
    const run = async () => {
      bootProgress.setValue(0);
      await new Promise<void>((resolve) => {
        anim = Animated.timing(bootProgress, {
          toValue: 1,
          duration: BOOT_MS,
          useNativeDriver: false, // animating width (layout)
        });
        anim.start(() => resolve());
      });
      if (!cancelled) setAppReady(true);
    };
    void run();
    return () => {
      cancelled = true;
      anim?.stop();
    };
  }, [bootProgress]);

  // IMPORTANT: don't rely on onLayout firing again after appReady flips.
  // Hide the native splash as soon as we're ready.
  useEffect(() => {
    if (!appReady) return;
    SplashScreen.hideAsync().catch(() => {
      // no-op
    });
  }, [appReady]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  const screen = useMemo(() => {
    switch (tab) {
      case "account":
        return <PlaceholderScreen title="Account" />;
      case "testare":
        return <TestScreen />;
      case "regionalisme":
        return <RegionalismeScreen />;
      case "urbanisme":
        return <UrbanismeScreen />;
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
        onLayout={onLayoutRootView}
      >
        <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
        {appReady ? (
          <>
            <View style={styles.content}>{screen}</View>
            <BottomTabs active={tab} onChange={setTab} />
          </>
        ) : (
          <BootSplash progress={bootProgress} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});

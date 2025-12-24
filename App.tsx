import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs, type TabKey } from "./src/components/BottomTabs";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { AccountScreen } from "./src/screens/AccountScreen";
import { VocabularyScreen } from "./src/screens/VocabularyScreen";
import { ThemeProvider, useTheme } from "./src/theme/theme";
import { TestScreen } from "./src/screens/TestScreen";
import { RegionalismeScreen } from "./src/screens/RegionalismeScreen";
import { UrbanismeScreen } from "./src/screens/UrbanismeScreen";
import { WordDetailScreen } from "./src/screens/WordDetailScreen";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { BootSplash } from "./src/screens/BootSplash";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { supabase, isSupabaseConfigured } from "./src/lib/supabase";
import * as Device from "expo-device";
import Constants from "expo-constants";

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// Configure notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn("Could not set notification handler:", error);
}

function AppInner() {
  const [tab, setTab] = useState<TabKey>("cuvinte");
  const [viewingWordId, setViewingWordId] = useState<string | null>(null);
  const { theme } = useTheme();
  const [appReady, setAppReady] = useState(false);
  const bootProgress = useRef(new Animated.Value(0)).current;
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [currentSession, setCurrentSession] = useState<any>(null);

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

  // Get current session for associating tokens with users
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentSession(session);
    };

    void getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save push token to Supabase
  const savePushToken = useCallback(async (token: string) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log("⚠️ Supabase not configured, skipping token save");
      return;
    }

    try {
      console.log("💾 Attempting to save push token to Supabase...");
      console.log("💾 Token:", token);
      
      // Get device info
      const deviceInfo = Platform.OS === "ios" 
        ? `iOS ${Device.osVersion || "unknown"}` 
        : `Android ${Device.osVersion || "unknown"}`;
      console.log("💾 Device info:", deviceInfo);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      console.log("💾 User ID:", userId || "null (not logged in)");

      // Use upsert to handle both insert and update cases
      // This avoids duplicate key errors and RLS policy issues
      const { error } = await supabase
        .from("cuvinteziPushTokens")
        .upsert(
          {
            token: token,
            user_id: userId,
            device_info: deviceInfo,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "token",
            ignoreDuplicates: false,
          }
        );

      if (error) {
        // If it's a duplicate key error, try to update instead
        if (error.code === "23505" || error.message?.includes("duplicate key")) {
          console.log("⚠️ Token already exists, updating instead...");
          const { error: updateError } = await supabase
            .from("cuvinteziPushTokens")
            .update({
              user_id: userId,
              device_info: deviceInfo,
              updated_at: new Date().toISOString(),
            })
            .eq("token", token);

          if (updateError) {
            console.error("❌ Error updating push token:", updateError);
            throw updateError;
          }
          console.log("✅ Updated existing push token in Supabase");
        } else {
          console.error("❌ Error upserting push token:", error);
          throw error;
        }
      } else {
        console.log("✅ Saved/updated push token in Supabase");
      }
    } catch (error) {
      console.error("❌ Error saving push token to Supabase:", error);
      console.error("❌ Full error details:", JSON.stringify(error, null, 2));
    }
  }, []);

  // Update token association when user logs in/out
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || Platform.OS === "web") return;

    const updateTokenAssociation = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        // Get device info
        const deviceInfo = Platform.OS === "ios" 
          ? `iOS ${Device.osVersion || "unknown"}` 
          : `Android ${Device.osVersion || "unknown"}`;

        // Try to get the token again
        try {
          const { status } = await Notifications.getPermissionsAsync();
          if (status === "granted") {
            const tokenData = await Notifications.getExpoPushTokenAsync({
              projectId: "aa40ced7-dddf-43c9-99d2-3fdf3a48820c",
            });
            
            // Update token with current user
            const { data: existingToken } = await supabase
              .from("cuvinteziPushTokens")
              .select("id")
              .eq("token", tokenData.data)
              .single();

            if (existingToken) {
              await supabase
                .from("cuvinteziPushTokens")
                .update({
                  user_id: userId,
                  device_info: deviceInfo,
                })
                .eq("token", tokenData.data);
              console.log("✅ Updated token association with user");
            } else {
              // Token doesn't exist yet, save it
              await savePushToken(tokenData.data);
            }
          }
        } catch (error) {
          // Token might not be available yet, that's okay
          console.log("ℹ️ Token not available for association update");
        }
      } catch (error) {
        console.error("❌ Error updating token association:", error);
      }
    };

    void updateTokenAssociation();
  }, [currentSession, savePushToken]);

  // Register for push notifications (native platforms only)
  useEffect(() => {
    console.log("🔔 Push notification registration - Platform:", Platform.OS);
    
    // Skip push notification registration on web
    if (Platform.OS === "web") {
      console.log("⚠️ Push notifications are not supported on web. Use native platforms (iOS/Android) for push notifications.");
      return;
    }

    // Skip push notification registration in Expo Go on Android (not supported in SDK 53+)
    try {
      if (Constants?.executionEnvironment === Constants?.ExecutionEnvironment?.StoreClient && Platform.OS === "android") {
        console.log("⚠️ Push notifications are not supported in Expo Go on Android (SDK 53+). Use a development build instead.");
        return;
      }
    } catch (error) {
      // Constants might not be available in some builds, continue anyway
      console.log("⚠️ Could not check execution environment, continuing with push notification registration");
    }

    const registerForPushNotifications = async () => {
      try {
        console.log("📱 Starting push notification registration...");
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log("📱 Current permission status:", existingStatus);
        let finalStatus = existingStatus;
        
        if (existingStatus !== "granted") {
          console.log("📱 Requesting notification permissions...");
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log("📱 Permission request result:", status);
        }
        
        if (finalStatus !== "granted") {
          console.log("❌ Failed to get push token - permissions not granted!");
          return;
        }
        
        console.log("📱 Getting Expo Push Token...");
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: "aa40ced7-dddf-43c9-99d2-3fdf3a48820c",
        });
        console.log("✅ Expo Push Token:", token.data);
        console.log("📋 Copy this token to send notifications:");
        console.log("   ", token.data);
        
        // Save token to Supabase
        await savePushToken(token.data);
      } catch (error) {
        console.error("❌ Error registering for push notifications:", error);
      }
    };

    void registerForPushNotifications();
  }, [savePushToken]);

  // Handle notification received while app is foregrounded
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  // Handle notification tap
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("Notification tapped:", data);
      
      // Handle word notification
      if (data?.type === "word" && data?.wordId) {
        setViewingWordId(data.wordId);
        setTab("cuvinte"); // Switch to cuvinte tab if needed
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams, hostname } = Linking.parse(event.url);
      console.log("Deep link received:", path, queryParams, hostname);
      
      // Handle word deep link: cuvinteaza.app://word/word-id
      // Path can be "word/word-id" or just "word" with id in queryParams
      if (path) {
        const pathParts = path.split("/");
        if (pathParts[0] === "word") {
          const wordId = pathParts[1] || queryParams?.id;
          if (wordId) {
            setViewingWordId(wordId as string);
            setTab("cuvinte");
          }
        }
      } else if (hostname === "word" && queryParams?.id) {
        // Alternative format: cuvinteaza.app://word?id=word-id
        setViewingWordId(queryParams.id as string);
        setTab("cuvinte");
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const screen = useMemo(() => {
    if (viewingWordId) {
      return (
        <WordDetailScreen
          wordId={viewingWordId}
          onBack={() => setViewingWordId(null)}
        />
      );
    }

    switch (tab) {
      case "account":
        return <AccountScreen onNavigateToWord={setViewingWordId} />;
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
  }, [tab, viewingWordId]);

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
            <BottomTabs
              active={tab}
              onChange={(newTab) => {
                setViewingWordId(null);
                setTab(newTab);
              }}
            />
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

import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ThemeIcon } from "../components/icons/ThemeIcon";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { LikedWords } from "../components/LikedWords";
import { LastTestResults } from "../components/LastTestResults";
import { TestTimeline } from "../components/TestTimeline";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { LogOut } from "lucide-react-native";

export function AccountScreen({
  onNavigateToWord,
  onNavigateToTest,
}: {
  onNavigateToWord?: (wordId: string) => void;
  onNavigateToTest?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [vocabularyLevel, setVocabularyLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [age, setAge] = useState<string>("47");
  const [notificationTimeframe, setNotificationTimeframe] = useState<"7-10" | "12-16" | "16-20" | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [checkingToken, setCheckingToken] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setVocabularyLevel(null);
        setAge("47");
        setNotificationTimeframe(null);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("cuvinteziProfile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay
        console.error("Failed to load profile:", error);
        return;
      }

      if (data) {
        setVocabularyLevel(data.vocabulary_level || null);
        setAge(data.age ? String(data.age) : "47");
        setNotificationTimeframe(data.notification_timeframe || null);
        setNotificationsEnabled(data.notifications_enabled || false);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, []);

  // Check notification permissions and get token on mount
  useEffect(() => {
    if (Platform.OS === "web") {
      setNotificationsEnabled(false);
      setPushToken(null);
      return;
    }

    const checkNotificationStatus = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        const isEnabled = status === "granted";
        setNotificationsEnabled(isEnabled);

        if (isEnabled) {
          try {
            const token = await Notifications.getExpoPushTokenAsync({
              projectId: "aa40ced7-dddf-43c9-99d2-3fdf3a48820c",
            });
            setPushToken(token.data);
          } catch (error) {
            console.error("Failed to get push token:", error);
          }
        }
      } catch (error) {
        console.error("Failed to check notification permissions:", error);
      }
    };

    void checkNotificationStatus();
  }, []);

  // Handle notification toggle
  const handleNotificationToggle = useCallback(async (value: boolean) => {
    if (Platform.OS === "web") {
      Alert.alert("Notificări", "Notificările push nu sunt disponibile în browser.");
      return;
    }

    // Check if running in Expo Go (which doesn't support push notifications on Android)
    try {
      if (Constants?.executionEnvironment === Constants?.ExecutionEnvironment?.StoreClient && Platform.OS === "android") {
        Alert.alert(
          "Notificări indisponibile",
          "Notificările push nu sunt disponibile în Expo Go pentru Android.\n\n" +
          "Pentru a testa notificările push, folosește:\n" +
          "• Un development build (eas build --profile development)\n" +
          "• Sau un build de producție (eas build --platform android)\n\n" +
          "Citește mai multe: https://docs.expo.dev/develop/development-builds/introduction/"
        );
        setNotificationsEnabled(false);
        return;
      }
    } catch (error) {
      // Constants might not be available in some builds, continue anyway
      console.log("⚠️ Could not check execution environment, continuing with notification toggle");
    }

    if (value) {
      // Toggling ON - request permissions
      setCheckingToken(true);
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === "granted") {
          setNotificationsEnabled(true);
          try {
            console.log("📱 Requesting Expo Push Token with projectId: aa40ced7-dddf-43c9-99d2-3fdf3a48820c");
            console.log("📱 Platform:", Platform.OS, "Version:", Platform.Version);
            
            const token = await Notifications.getExpoPushTokenAsync({
              projectId: "aa40ced7-dddf-43c9-99d2-3fdf3a48820c",
            });
            
            console.log("✅ Successfully got push token:", token.data);
            setPushToken(token.data);

            // Save token to Supabase
            if (isSupabaseConfigured && supabase) {
              const { data: { session } } = await supabase.auth.getSession();
              const userId = session?.user?.id || null;
              const deviceInfo = Platform.OS === "ios" 
                ? `iOS ${Device.osVersion || "unknown"}` 
                : `Android ${Device.osVersion || "unknown"}`;

              // Use upsert to handle duplicate tokens gracefully
              const { error: tokenError } = await supabase
                .from("cuvinteziPushTokens")
                .upsert(
                  {
                    token: token.data,
                    user_id: userId,
                    device_info: deviceInfo,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "token",
                    ignoreDuplicates: false,
                  }
                );

              if (tokenError) {
                // If it's a duplicate key error, try to update instead
                if (tokenError.code === "23505" || tokenError.message?.includes("duplicate key")) {
                  console.log("⚠️ Token already exists, updating instead...");
                  const { error: updateError } = await supabase
                    .from("cuvinteziPushTokens")
                    .update({
                      user_id: userId,
                      device_info: deviceInfo,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("token", token.data);

                  if (updateError) {
                    console.error("Failed to update push token:", updateError);
                  }
                } else {
                  console.error("Failed to save push token:", tokenError);
                }
              }

              // Save notifications_enabled to profile
              if (userId) {
                // Get current profile to preserve existing values
                const { data: currentProfile } = await supabase
                  .from("cuvinteziProfile")
                  .select("notification_timeframe, vocabulary_level, age")
                  .eq("user_id", userId)
                  .single();

                const { error: profileError } = await supabase
                  .from("cuvinteziProfile")
                  .upsert({
                    user_id: userId,
                    notifications_enabled: true,
                    notification_timeframe: currentProfile?.notification_timeframe || notificationTimeframe || null,
                    vocabulary_level: currentProfile?.vocabulary_level || vocabularyLevel || null,
                    age: currentProfile?.age || (age ? parseInt(age, 10) : null),
                  }, { onConflict: "user_id" });

                if (profileError) {
                  console.error("Failed to save notification preference:", profileError);
                  Alert.alert("Eroare", "Nu s-a putut salva preferința de notificare.");
                }
              }
            }
          } catch (error: any) {
            console.error("❌ Failed to get push token:", error);
            console.error("❌ Error type:", typeof error);
            console.error("❌ Error message:", error?.message);
            console.error("❌ Error code:", error?.code);
            console.error("❌ Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            
            let errorMessage = "Eroare necunoscută";
            if (error?.message) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            } else if (error?.toString) {
              errorMessage = error.toString();
            }

            // Check for specific error types
            let userFriendlyMessage = "Nu s-a putut obține token-ul de notificare.\n\n";
            
            if (errorMessage.includes("SERVICE_NOT_AVAILABLE") || errorMessage.includes("Google Play Services")) {
              userFriendlyMessage += "Google Play Services nu este disponibil sau nu este actualizat.\n\n";
              userFriendlyMessage += "Soluție:\n";
              userFriendlyMessage += "1. Actualizează Google Play Services din Google Play Store\n";
              userFriendlyMessage += "2. Asigură-te că dispozitivul are conexiune la internet\n";
              userFriendlyMessage += "3. Repornește aplicația";
            } else if (errorMessage.includes("network") || errorMessage.includes("Network")) {
              userFriendlyMessage += "Probleme de conectivitate la rețea.\n\n";
              userFriendlyMessage += "Verifică conexiunea la internet și încearcă din nou.";
            } else {
              userFriendlyMessage += `Detalii: ${errorMessage}\n\n`;
              userFriendlyMessage += "Asigură-te că:\n";
              userFriendlyMessage += "1. Aplicația este construită cu EAS Build\n";
              userFriendlyMessage += "2. Google Play Services este instalat și actualizat\n";
              userFriendlyMessage += "3. Dispozitivul are conexiune la internet";
            }

            Alert.alert("Eroare", userFriendlyMessage);
            
            // Don't set notifications enabled if we couldn't get the token
            setNotificationsEnabled(false);
          }
        } else {
          setNotificationsEnabled(false);
          Alert.alert(
            "Permisiuni necesare",
            "Pentru a primi notificări, trebuie să acordați permisiunea în setările aplicației."
          );
        }
      } catch (error) {
        console.error("Failed to request notification permissions:", error);
        Alert.alert("Eroare", "Nu s-au putut solicita permisiunile pentru notificări.");
      } finally {
        setCheckingToken(false);
      }
    } else {
      // Toggling OFF
      setNotificationsEnabled(false);
      setPushToken(null);

      // Save notifications_enabled to profile
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        if (userId) {
          // Get current profile to preserve existing values
          const { data: currentProfile } = await supabase
            .from("cuvinteziProfile")
            .select("notification_timeframe, vocabulary_level, age")
            .eq("user_id", userId)
            .single();

          const { error: profileError } = await supabase
            .from("cuvinteziProfile")
            .upsert({
              user_id: userId,
              notifications_enabled: false,
              notification_timeframe: currentProfile?.notification_timeframe || notificationTimeframe || null,
              vocabulary_level: currentProfile?.vocabulary_level || vocabularyLevel || null,
              age: currentProfile?.age || (age ? parseInt(age, 10) : null),
            }, { onConflict: "user_id" });

          if (profileError) {
            console.error("Failed to save notification preference:", profileError);
            Alert.alert("Eroare", "Nu s-a putut salva preferința de notificare.");
          }
        }
      }
    }
  }, []);

  const saveProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !session?.user) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = {
        user_id: session.user.id,
        vocabulary_level: vocabularyLevel,
        age: age ? parseInt(age, 10) : null,
        notification_timeframe: notificationTimeframe,
        notifications_enabled: notificationsEnabled,
      };

      const { error } = await supabase
        .from("cuvinteziProfile")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) throw error;

      Alert.alert("Succes", "Profilul a fost actualizat!");
      setIsProfileExpanded(false);
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare la salvarea profilului.");
    } finally {
      setProfileLoading(false);
    }
  }, [session, vocabularyLevel, age, notificationTimeframe, notificationsEnabled]);

  const handlePasswordChange = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !session?.user) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      Alert.alert("Eroare", "Te rugăm să completezi ambele câmpuri pentru parolă.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Eroare", "Parolele nu se potrivesc.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Eroare", "Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }

    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert("Succes", "Parola a fost actualizată!");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordChange(false);
      setIsProfileExpanded(false);
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare la actualizarea parolei.");
    } finally {
      setProfileLoading(false);
    }
  }, [session, newPassword, confirmNewPassword]);

  const handleEmailAuth = async () => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    setLoginError(null);

    // Validate all mandatory fields
    if (authMode === "register") {
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
        setLoginError("Toate câmpurile sunt obligatorii");
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setLoginError("Toate câmpurile sunt obligatorii");
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLoginError("Formatul email-ului este incorect");
      return;
    }

    // Validate passwords match (for registration)
    if (authMode === "register") {
      if (password !== confirmPassword) {
        setLoginError("Parolele nu se potrivesc");
        return;
      }
      if (password.length < 6) {
        setLoginError("Parola trebuie să aibă cel puțin 6 caractere.");
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) {
          setLoginError(error.message || "A apărut o eroare la înregistrare.");
          setAuthLoading(false);
          return;
        }
        // Show email verification state
        setVerificationEmail(email);
        setEmailVerificationSent(true);
        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setLoginError(null);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setLoginError(error.message || "Email sau parolă incorectă.");
          setAuthLoading(false);
          return;
        }
        // Clear form and error on success
        setEmail("");
        setPassword("");
        setLoginError(null);
      }
    } catch (error: any) {
      setLoginError(error.message || "A apărut o eroare.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    if (!resetEmail) {
      Alert.alert("Eroare", "Te rugăm să introduci adresa de email.");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: "cuvinteaza.app://reset-password",
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare la trimiterea email-ului de resetare.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
      });
      if (error) throw error;
      Alert.alert("Succes", "Email de verificare trimis din nou!");
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare la retrimiterea email-ului.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Show message if authentication is not configured
  if (!isSupabaseConfigured) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.comingSoonContainer}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Account
          </Text>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Authentication needs to be configured.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.iconActive} />
      </View>
    );
  }

  if (session) {
    // Get user name from metadata or fallback to email
    const userName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "User";

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Biblioteca mea
            </Text>
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
                accessibilityLabel="Logout"
                style={[styles.iconBtn, { backgroundColor: theme.colors.headerIconBg }]}
                onPress={handleSignOut}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.iconActive} />
                ) : (
                  <LogOut size={22} color={theme.colors.iconActive} />
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, { color: theme.colors.textPrimary }]}>
                Bine ai venit, {userName}.
              </Text>
              <Text style={[styles.vipText, { color: theme.colors.textSecondary }]}>
                Aici cititorii sunt VIP.
              </Text>
            </View>
            <Pressable
              onPress={() => setIsProfileExpanded(!isProfileExpanded)}
              style={[styles.editButton, { backgroundColor: theme.colors.tabActiveBg }]}
            >
              <Text style={[styles.editButtonText, { color: theme.colors.textPrimary }]}>
                Edit
              </Text>
            </Pressable>
          </View>

          {isProfileExpanded && (
            <View style={styles.profileSection}>
              {/* Vocabulary Level */}
              <View style={styles.profileField}>
                <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                  Nivelul tău de vocabular
                </Text>
                <View style={styles.radioGroup}>
                  {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                    <Pressable
                      key={level}
                      onPress={() => setVocabularyLevel(level)}
                      style={[
                        styles.radioOption,
                        {
                          backgroundColor:
                            vocabularyLevel === level
                              ? theme.colors.iconActive
                              : theme.colors.background,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          {
                            color:
                              vocabularyLevel === level
                                ? theme.colors.background
                                : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {level === "beginner"
                          ? "Începător"
                          : level === "intermediate"
                          ? "Intermediar"
                          : "Avansat"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Age */}
              <View style={styles.profileField}>
                <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                  Vârsta
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.textPrimary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="47"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={age}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (text === "" || (!isNaN(num) && num >= 4 && num <= 120)) {
                      setAge(text);
                    }
                  }}
                  keyboardType="number-pad"
                  editable={!profileLoading}
                />
              </View>

              {/* Allow Notifications Toggle */}
              <View style={styles.profileField}>
                <View style={styles.toggleRow}>
                  <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                    Permite notificări
                  </Text>
                  {checkingToken ? (
                    <ActivityIndicator size="small" color={theme.colors.iconActive} />
                  ) : (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={handleNotificationToggle}
                      trackColor={{ false: theme.colors.border, true: theme.colors.iconActive }}
                      thumbColor={theme.colors.background}
                    />
                  )}
                </View>
              </View>

              {/* Push Token Display */}
              {pushToken && (
                <View style={styles.profileField}>
                  <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                    Token notificare push
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.tokenInput,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.textSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={pushToken}
                    editable={false}
                    multiline
                    selectTextOnFocus
                  />
                </View>
              )}

              {/* Notification Timeframe */}
              <View style={styles.profileField}>
                <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                  Interval preferat pentru notificări zilnice
                </Text>
                <View style={styles.radioGroup}>
                  {(["7-10", "12-16", "16-20"] as const).map((timeframe) => (
                    <Pressable
                      key={timeframe}
                      onPress={() => setNotificationTimeframe(timeframe)}
                      style={[
                        styles.radioOption,
                        {
                          backgroundColor:
                            notificationTimeframe === timeframe
                              ? theme.colors.iconActive
                              : theme.colors.background,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          {
                            color:
                              notificationTimeframe === timeframe
                                ? theme.colors.background
                                : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {timeframe}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Save Profile Button */}
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.colors.iconActive },
                  profileLoading && styles.buttonDisabled,
                ]}
                onPress={saveProfile}
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: theme.colors.background }]}>
                    Salvează profilul
                  </Text>
                )}
              </Pressable>

              {/* Change Password Section */}
              {!showPasswordChange ? (
                <Pressable
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: theme.colors.tabActiveBg },
                  ]}
                  onPress={() => setShowPasswordChange(true)}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.colors.textPrimary }]}>
                    Schimbă parola
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.passwordChangeSection}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Parolă nouă"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!profileLoading}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Confirmă parola nouă"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!profileLoading}
                  />
                  <View style={styles.passwordButtons}>
                    <Pressable
                      style={[
                        styles.button,
                        styles.secondaryButton,
                        { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border, flex: 1 },
                      ]}
                      onPress={() => {
                        setShowPasswordChange(false);
                        setNewPassword("");
                        setConfirmNewPassword("");
                      }}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>
                        Anulează
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.button,
                        styles.primaryButton,
                        { backgroundColor: theme.colors.iconActive, flex: 1, marginLeft: 12 },
                        profileLoading && styles.buttonDisabled,
                      ]}
                      onPress={handlePasswordChange}
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.background} />
                      ) : (
                        <Text style={[styles.primaryButtonText, { color: theme.colors.background }]}>
                          Actualizează
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <LikedWords session={session} onNavigateToWord={onNavigateToWord} />
        </View>

        <LastTestResults session={session} />

        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <TestTimeline session={session} onNavigateToTest={onNavigateToTest} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {authMode === "login" ? "Conectare" : "Înregistrare"}
              </Text>
              {authMode === "register" && (
                <Pressable
                  onPress={() => {
                    setAuthMode("login");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setFullName("");
                    setLoginError(null);
                    setShowForgotPassword(false);
                  }}
                >
                  <Text style={[styles.switchMode, { color: theme.colors.iconActive }]}>
                    Ai deja cont? Conectează-te
                  </Text>
                </Pressable>
              )}
            </View>
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

      {!emailVerificationSent && (
        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          {showForgotPassword ? (
          <>
            {resetEmailSent ? (
              <>
                <Text style={[styles.resetEmailSentTitle, { color: theme.colors.textPrimary }]}>
                  Email trimis!
                </Text>
                <Text style={[styles.resetEmailSentText, { color: theme.colors.textSecondary }]}>
                  Am trimis un email de resetare a parolei la {resetEmail}. Verifică inbox-ul și folderul de spam.
                </Text>
                <Pressable
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: theme.colors.iconActive },
                  ]}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setResetEmailSent(false);
                  }}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.colors.background }]}>
                    Înapoi la login
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.forgotPasswordTitle, { color: theme.colors.textPrimary }]}>
                  Resetează parola
                </Text>
                <Text style={[styles.forgotPasswordText, { color: theme.colors.textSecondary }]}>
                  Introdu adresa ta de email și îți vom trimite un link pentru resetarea parolei.
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.textPrimary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!authLoading}
                />
                <View style={styles.forgotPasswordActions}>
                  <Pressable
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border, flex: 1 },
                    ]}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>
                      Anulează
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.iconActive, flex: 1 },
                      authLoading && styles.buttonDisabled,
                    ]}
                    onPress={handlePasswordReset}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.background} />
                    ) : (
                      <Text style={[styles.primaryButtonText, { color: theme.colors.background }]}>
                        Trimite
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </>
        ) : !emailVerificationSent ? (
          <>
            {authMode === "register" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Numele tău"
                placeholderTextColor={theme.colors.textSecondary}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setLoginError(null);
                }}
                autoCapitalize="words"
                autoComplete="name"
                editable={!authLoading}
              />
            )}

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLoginError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!authLoading}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Parolă"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLoginError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={authMode === "login" ? "password" : "password-new"}
              editable={!authLoading}
            />

            {authMode === "register" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Confirmă parola"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setLoginError(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!authLoading}
              />
            )}

            {loginError && (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { color: "#FFB4B4" }]}>{loginError}</Text>
              </View>
            )}

            {authMode === "login" && (
              <Pressable
                onPress={() => {
                  setShowForgotPassword(true);
                  setLoginError(null);
                }}
                style={styles.forgotPasswordLink}
              >
                <Text style={[styles.forgotPasswordLinkText, { color: theme.colors.iconActive }]}>
                  Ai uitat parola?
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.colors.iconActive },
                authLoading && styles.buttonDisabled,
              ]}
              onPress={handleEmailAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.colors.background }]}>
                  {authMode === "login" ? "Conectează-te" : "Înregistrează-te"}
                </Text>
              )}
            </Pressable>
          </>
        ) : null}
        </View>
      )}

      {/* Benefits section - only shown in login mode */}
      {authMode === "login" && (
        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <Pressable
            style={[
              styles.button,
              styles.primaryButton,
              { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border },
            ]}
            onPress={() => {
              setAuthMode("register");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setFullName("");
              setLoginError(null);
              setShowForgotPassword(false);
            }}
          >
            <Text style={[styles.primaryButtonText, { color: theme.colors.textPrimary }]}>
              Crează utilizator nou dacă vrei să
            </Text>
          </Pressable>

          <View style={styles.benefitsSection}>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitTextContainer}>
                  <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                    <Text style={[styles.benefitTextBold, { color: theme.colors.textPrimary }]}>
                      Te exprimi mai clar și cu mai multă încredere
                    </Text>
                    {"\n"}
                    <Text style={styles.benefitDescription}>
                      Un vocabular bogat te ajută să spui exact ce gândești, fără ezitări, fie în conversații zilnice, fie în contexte profesionale.
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitTextContainer}>
                  <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                    <Text style={[styles.benefitTextBold, { color: theme.colors.textPrimary }]}>
                      Înveți puțin în fiecare zi, fără efort
                    </Text>
                    {"\n"}
                    <Text style={styles.benefitDescription}>
                      Notificările zilnice transformă câteva secunde libere în progres constant — fără cursuri complicate sau timp pierdut.
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitTextContainer}>
                  <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                    <Text style={[styles.benefitTextBold, { color: theme.colors.textPrimary }]}>
                      Înțelegi limbajul real, nu doar pe cel din manuale
                    </Text>
                    {"\n"}
                    <Text style={styles.benefitDescription}>
                      Expresii, argou și sensuri moderne te ajută să comunici natural și să fii mereu conectat la realitate.
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitTextContainer}>
                  <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                    <Text style={[styles.benefitTextBold, { color: theme.colors.textPrimary }]}>
                      Îți antrenezi mintea și abilitățile de comunicare
                    </Text>
                    {"\n"}
                    <Text style={styles.benefitDescription}>
                      Un vocabular mai bogat îmbunătățește memoria, înțelegerea textelor și gândirea critică.
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Email Verification State */}
      {emailVerificationSent && (
        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <Text style={[styles.verificationTitle, { color: theme.colors.textPrimary }]}>
            Email de verificare trimis
          </Text>
          <Text style={[styles.verificationText, { color: theme.colors.textSecondary }]}>
            Am trimis un email de verificare la {verificationEmail}. Te rugăm să verifici inbox-ul și folderul de spam pentru a confirma contul.
          </Text>
          <View style={styles.verificationActions}>
            <Pressable
              style={[
                styles.button,
                styles.secondaryButton,
                { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border },
                authLoading && styles.buttonDisabled,
              ]}
              onPress={handleResendVerification}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              ) : (
                <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>
                  Retrimite email
                </Text>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.secondaryButton,
                { backgroundColor: theme.colors.tabActiveBg, borderColor: theme.colors.border },
              ]}
              onPress={() => {
                setEmailVerificationSent(false);
                setAuthMode("login");
                setEmail(verificationEmail);
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>
                Mergi la login
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  switchMode: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  benefitsSection: {
    marginTop: 20,
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    alignItems: "flex-start",
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitTextBold: {
    fontWeight: "700",
  },
  benefitDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    borderWidth: 1,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  verificationActions: {
    flexDirection: "row",
    gap: 12,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  welcomeContainer: {
    flex: 1,
    gap: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
  },
  vipText: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  profileSection: {
    marginTop: 20,
    gap: 20,
  },
  profileField: {
    gap: 8,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenInput: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    minHeight: 60,
    paddingTop: 8,
    paddingBottom: 8,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  radioOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  passwordChangeSection: {
    gap: 12,
    marginTop: 8,
  },
  passwordButtons: {
    flexDirection: "row",
    gap: 12,
  },
  logoutButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  comingSoonText: {
    fontSize: 14,
  },
  errorBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 97, 97, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 97, 97, 0.35)",
    gap: 6,
  },
  errorText: {
    color: "#FFD1D1",
    fontSize: 12,
    lineHeight: 16,
  },
  forgotPasswordLink: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  forgotPasswordLinkText: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  forgotPasswordTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  forgotPasswordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    alignItems: "center",
  },
  resetEmailSentTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  resetEmailSentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
});


import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
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

export function AccountScreen() {
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
  const [vocabularyLevel, setVocabularyLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [age, setAge] = useState<string>("47");
  const [notificationTimeframe, setNotificationTimeframe] = useState<"7-10" | "12-4" | "4-8" | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

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
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
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
  }, [session, vocabularyLevel, age, notificationTimeframe]);

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

    if (!email || !password) {
      Alert.alert("Eroare", "Te rugăm să completezi toate câmpurile obligatorii.");
      return;
    }

    if (authMode === "register") {
      if (!fullName.trim()) {
        Alert.alert("Eroare", "Te rugăm să introduci numele complet.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Eroare", "Parolele nu se potrivesc.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Eroare", "Parola trebuie să aibă cel puțin 6 caractere.");
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
        if (error) throw error;
        // Show email verification state
        setVerificationEmail(email);
        setEmailVerificationSent(true);
        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Clear form
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare.");
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
              Account
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
                style={[
                  styles.logoutButtonHeader,
                  { backgroundColor: theme.colors.tabActiveBg },
                ]}
                onPress={handleSignOut}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.textPrimary} />
                ) : (
                  <Text style={[styles.logoutButtonText, { color: theme.colors.textPrimary }]}>
                    Logout
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <View style={styles.welcomeRow}>
            <Text style={[styles.welcomeText, { color: theme.colors.textPrimary }]}>
              Bine ai venit {userName}!
            </Text>
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

              {/* Notification Timeframe */}
              <View style={styles.profileField}>
                <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
                  Interval preferat pentru notificări zilnice
                </Text>
                <View style={styles.radioGroup}>
                  {(["7-10", "12-4", "4-8"] as const).map((timeframe) => (
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
          <LikedWords session={session} />
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

      <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
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
            placeholder="Nume complet"
            placeholderTextColor={theme.colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
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
          onChangeText={setEmail}
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
          onChangeText={setPassword}
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
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            editable={!authLoading}
          />
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
      </View>

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
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
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
});


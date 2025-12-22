import { useState, useEffect } from "react";
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
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// Complete OAuth flow in browser
WebBrowser.maybeCompleteAuthSession();

export function AccountScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEmailAuth = async () => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    if (!email || !password) {
      Alert.alert("Eroare", "Te rugăm să completezi toate câmpurile.");
      return;
    }

    if (authMode === "register") {
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
        });
        if (error) throw error;
        Alert.alert(
          "Succes",
          "Cont creat! Verifică email-ul pentru a confirma contul."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Eroare", "Autentificarea nu este configurată.");
      return;
    }

    try {
      setAuthLoading(true);

      const redirectTo = AuthSession.makeRedirectUri({
        scheme: "cuvinteaza.app",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("No OAuth URL returned");

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === "success") {
        // Parse the URL to extract the code
        const url = new URL(result.url);
        const code = url.searchParams.get("code");
        const errorCode = url.searchParams.get("error");

        if (errorCode) {
          throw new Error(`OAuth error: ${errorCode}`);
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (exchangeError) throw exchangeError;
        }
      } else if (result.type === "cancel") {
        // User cancelled, no error needed
      }
    } catch (error: any) {
      Alert.alert("Eroare", error.message || "A apărut o eroare la autentificare.");
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
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Cont
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
          <View style={styles.userInfo}>
            <Text style={[styles.userEmail, { color: theme.colors.textPrimary }]}>
              {session.user.email}
            </Text>
            <Text style={[styles.userId, { color: theme.colors.textSecondary }]}>
              ID: {session.user.id.slice(0, 8)}...
            </Text>
          </View>

          <Pressable
            style={[
              styles.button,
              styles.signOutButton,
              { backgroundColor: theme.colors.tabActiveBg },
            ]}
            onPress={handleSignOut}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
                Deconectare
              </Text>
            )}
          </Pressable>
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
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {authMode === "login" ? "Conectare" : "Înregistrare"}
        </Text>
        <Pressable
          onPress={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }}
        >
          <Text style={[styles.switchMode, { color: theme.colors.iconActive }]}>
            {authMode === "login"
              ? "Nu ai cont? Înregistrează-te"
              : "Ai deja cont? Conectează-te"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.tabBarBg, borderColor: theme.colors.border }]}>
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
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {authMode === "login" ? "Conectează-te" : "Înregistrează-te"}
            </Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
            sau
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        <Pressable
          style={[
            styles.button,
            styles.socialButton,
            { backgroundColor: "#4285F4", borderColor: theme.colors.border },
          ]}
          onPress={() => handleOAuth("google")}
          disabled={authLoading}
        >
          <Text style={styles.socialButtonText}>Continuă cu Google</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.socialButton,
            { backgroundColor: "#1877F2", borderColor: theme.colors.border },
          ]}
          onPress={() => handleOAuth("facebook")}
          disabled={authLoading}
        >
          <Text style={styles.socialButtonText}>Continuă cu Facebook</Text>
        </Pressable>
      </View>
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
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  switchMode: {
    fontSize: 14,
    fontWeight: "600",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  socialButton: {
    borderWidth: 1,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  userInfo: {
    gap: 8,
    marginBottom: 20,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: "600",
  },
  userId: {
    fontSize: 14,
  },
  signOutButton: {
    marginTop: 8,
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


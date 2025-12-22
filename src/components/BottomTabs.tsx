import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountIcon } from "./icons/AccountIcon";
import { useTheme } from "../theme/theme";
import { BookIcon } from "./icons/BookIcon";
import { BuildingsIcon } from "./icons/BuildingsIcon";
import { GearIcon } from "./icons/GearIcon";
import { MapPinIcon } from "./icons/MapPinIcon";
import { QuizIcon } from "./icons/QuizIcon";

export type TabKey =
  | "account"
  | "testare"
  | "cuvinte"
  | "regionalisme"
  | "urbanisme"
  | "setari";

const LABELS: Record<TabKey, string> = {
  account: "Account",
  testare: "Testare",
  cuvinte: "Cuvinte",
  regionalisme: "Regionalisme",
  urbanisme: "Urbanisme",
  setari: "Setari",
};

export function BottomTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom,
          height: BOTTOM_TABS_HEIGHT + insets.bottom,
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TabButton
          label={LABELS.account}
          active={active === "account"}
          onPress={() => onChange("account")}
          icon={({ color }) => <AccountIcon color={color} />}
        />
        <TabButton
          label={LABELS.testare}
          active={active === "testare"}
          onPress={() => onChange("testare")}
          icon={({ color }) => <QuizIcon color={color} />}
        />
        <TabButton
          label={LABELS.cuvinte}
          active={active === "cuvinte"}
          onPress={() => onChange("cuvinte")}
          icon={({ color }) => <BookIcon color={color} />}
        />
        <TabButton
          label={LABELS.regionalisme}
          active={active === "regionalisme"}
          onPress={() => onChange("regionalisme")}
          icon={({ color }) => <MapPinIcon color={color} />}
        />
        <TabButton
          label={LABELS.urbanisme}
          active={active === "urbanisme"}
          onPress={() => onChange("urbanisme")}
          icon={({ color }) => <BuildingsIcon color={color} />}
        />
        <TabButton
          label={LABELS.setari}
          active={active === "setari"}
          onPress={() => onChange("setari")}
          icon={({ color }) => <GearIcon color={color} />}
        />
      </ScrollView>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: (args: { color: string }) => React.ReactNode;
}) {
  const { theme } = useTheme();
  const effectiveColor = active ? theme.colors.iconActive : theme.colors.iconInactive;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active && [styles.btnActive, { backgroundColor: theme.colors.tabActiveBg }],
        pressed && styles.btnPressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon({ color: effectiveColor })}</View> : null}
      <Text style={[styles.label, { color: effectiveColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export const BOTTOM_TABS_HEIGHT = 76;

const styles = StyleSheet.create({
  wrap: {
    height: BOTTOM_TABS_HEIGHT,
    borderTopWidth: 1,
  },
  scrollContent: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  btn: {
    height: "100%",
    width: 104,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 16,
    gap: 6,
  },
  btnActive: {
  },
  btnPressed: {
    opacity: 0.85,
  },
  icon: { height: 22, justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "800" },
});



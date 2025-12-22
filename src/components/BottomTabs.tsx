import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountIcon } from "./icons/AccountIcon";
import { useTheme } from "../theme/theme";
import { BookIcon } from "./icons/BookIcon";
import { BuildingsIcon } from "./icons/BuildingsIcon";
import { GearIcon } from "./icons/GearIcon";
import { MapPinIcon } from "./icons/MapPinIcon";
import { QuizIcon } from "./icons/QuizIcon";
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";
import { useRef, useState } from "react";

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
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  const canScrollLeft = scrollX > 0;
  const canScrollRight = contentWidth > scrollViewWidth && scrollX < contentWidth - scrollViewWidth - 10;

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
      <View style={styles.scrollContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
          scrollEventThrottle={16}
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
        {canScrollLeft && (
          <View style={[styles.fadeOverlay, styles.fadeLeft]} pointerEvents="none">
            <View style={[styles.fadeLayer, styles.fadeLayer1, { left: 0, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={[styles.fadeLayer, styles.fadeLayer2, { left: 16, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={[styles.fadeLayer, styles.fadeLayer3, { left: 32, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={styles.fadeIcon}>
              <ArrowLeftIcon color={theme.colors.iconInactive} size={14} />
            </View>
          </View>
        )}
        {canScrollRight && (
          <View style={[styles.fadeOverlay, styles.fadeRight]} pointerEvents="none">
            <View style={[styles.fadeLayer, styles.fadeLayer1, { right: 0, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={[styles.fadeLayer, styles.fadeLayer2, { right: 16, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={[styles.fadeLayer, styles.fadeLayer3, { right: 32, backgroundColor: theme.colors.tabBarBg }]} />
            <View style={styles.fadeIcon}>
              <ArrowRightIcon color={theme.colors.iconInactive} size={14} />
            </View>
          </View>
        )}
      </View>
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
  scrollContainer: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fadeOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 50,
    overflow: "hidden",
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
  fadeLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  fadeLayer1: {
    width: 16,
    opacity: 0.98,
  },
  fadeLayer2: {
    width: 16,
    opacity: 0.85,
  },
  fadeLayer3: {
    width: 18,
    opacity: 0.5,
  },
  fadeIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 50,
    justifyContent: "center",
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



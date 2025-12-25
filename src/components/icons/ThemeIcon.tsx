import Svg, { Path } from "react-native-svg";

export function ThemeIcon({
  mode,
  size = 22,
  color = "#EEF3FF",
}: {
  mode: "dark" | "light";
  size?: number;
  color?: string;
}) {
  // Show a sun in dark mode (switch to light), and a moon in light mode (switch to dark).
  return mode === "dark" ? (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  ) : (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.5 6.5 0 1 0 10.2 10.2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}








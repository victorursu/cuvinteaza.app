import { Moon, Sun } from "lucide-react-native";

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
    <Sun size={size} color={color} />
  ) : (
    <Moon size={size} color={color} />
  );
}








import { Share2 } from "lucide-react-native";

export function ShareIcon({
  size = 24,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return <Share2 size={size} color={color} />;
}


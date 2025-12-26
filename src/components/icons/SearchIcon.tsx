import { Search } from "lucide-react-native";

export function SearchIcon({
  size = 22,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return <Search size={size} color={color} />;
}


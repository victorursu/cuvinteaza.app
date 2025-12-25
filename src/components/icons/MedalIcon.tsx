import Svg, { Circle, Path } from "react-native-svg";

type MedalType = "gold" | "silver" | "bronze";

const MEDAL_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

export function MedalIcon({
  type,
  size = 32,
}: {
  type: MedalType;
  size?: number;
}) {
  const color = MEDAL_COLORS[type];

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {/* Medal circle */}
      <Circle cx="16" cy="16" r="14" fill={color} />
      {/* Ribbon top */}
      <Path
        d="M 12 4 L 12 8 L 8 8 L 8 12 L 24 12 L 24 8 L 20 8 L 20 4 Z"
        fill={color}
        opacity={0.8}
      />
      {/* Star in center */}
      <Path
        d="M 16 10 L 17.5 14 L 22 14 L 18.5 16.5 L 20 21 L 16 18 L 12 21 L 13.5 16.5 L 10 14 L 14.5 14 Z"
        fill="#000"
        opacity={0.3}
      />
    </Svg>
  );
}


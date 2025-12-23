import Svg, { Path } from "react-native-svg";

export function BuildingsIcon({
  size = 22,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 21V5a2 2 0 0 1 2-2h6v18H4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M12 21V9h6a2 2 0 0 1 2 2v10H12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M7 7h2M7 10h2M7 13h2M15 13h2M15 16h2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}





import Svg, { Path } from "react-native-svg";

export function GearIcon({
  size = 22,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a7.3 7.3 0 0 0-1.7-1l-.3-2.4H8.8L8.5 9a7.3 7.3 0 0 0-1.7 1L4.5 9.4l-2 3.4 2 1.2a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.2 2 3.4 2.3-.6a7.3 7.3 0 0 0 1.7 1l.3 2.4h6.4l.3-2.4a7.3 7.3 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2a7.9 7.9 0 0 0-.1-1Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}






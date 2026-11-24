import Svg, { Path } from 'react-native-svg';

interface SparkProps {
  size?: number;
  color: string;
}

/**
 * The AI mark: a four-point spark, always in the accent colour (doc 02 section 2.1). The only
 * custom icon; every other icon comes from lucide-react-native.
 */
export function Spark({ size = 16, color }: SparkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M12 2C12.6 7.6 16.4 11.4 22 12C16.4 12.6 12.6 16.4 12 22C11.4 16.4 7.6 12.6 2 12C7.6 11.4 11.4 7.6 12 2Z"
        fill={color}
      />
    </Svg>
  );
}

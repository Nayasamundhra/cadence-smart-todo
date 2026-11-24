import { useEffect, useState } from 'react';
import { Animated, type DimensionValue } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { useReduceMotion } from '@/design/useReduceMotion';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Placeholder for network content only (doc 02 section 2.8): a 1.2 s opacity pulse between 0.6 and 1.
 * Local data never shows one. With Reduce motion it stays still.
 */
export function Skeleton({ width = '100%', height = 16, rounded = 'sm' }: SkeletonProps) {
  const { colors, controls, radius } = useTheme();
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const half = controls.skeletonPulse / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: controls.skeletonLow,
          duration: half,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: half, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity, controls.skeletonPulse, controls.skeletonLow]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width,
        height,
        borderRadius: radius[rounded],
        backgroundColor: colors.surfaceAlt,
        opacity,
      }}
    />
  );
}

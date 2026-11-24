import { Image, View } from 'react-native';
import { useTheme } from '@/design/ThemeProvider';
import { Text } from './Text';

export interface AvatarProps {
  /** Used for the initials fallback and the accessibility label. */
  name: string;
  size?: 'sm' | 'lg';
  imageUri?: string;
  testID?: string;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** 32 or 64 px, initials on accentSoft when there is no image. */
export function Avatar({ name, size = 'sm', imageUri, testID }: AvatarProps) {
  const { colors, controls, radius } = useTheme();
  const dimension = controls.avatar[size];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      testID={testID}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: radius.full,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: dimension, height: dimension }} />
      ) : (
        <Text
          variant={size === 'lg' ? 'title2' : 'caption'}
          color="accent"
          importantForAccessibility="no"
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

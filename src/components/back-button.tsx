import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BackButtonProps = {
  accessibilityLabel: string;
  fallbackHref: Href;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({ accessibilityLabel, fallbackHref, style }: BackButtonProps) {
  const router = useRouter();
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={goBack}
      style={({ pressed }) => [
        styles.button,
        style,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
        Platform.OS === 'web' && isFocused && {
          outlineColor: theme.focusRing,
          outlineStyle: 'solid',
          outlineWidth: 3,
          outlineOffset: 2,
        },
      ]}>
      <ThemedText style={styles.label}>← Atrás</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  label: { fontSize: 16, lineHeight: 22, fontWeight: 700 },
});

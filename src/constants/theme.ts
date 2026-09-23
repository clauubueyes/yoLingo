/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D4246',
    background: '#FFFCF7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E1F5EF',
    textSecondary: '#667C7D',
    accent: '#63C9B0',
    accentHover: '#56BDA4',
    accentPressed: '#49AE96',
    accentText: '#173F43',
    accentShadow: '#3C9F89',
    focusRing: '#6B56CF',
    decorationPurple: '#8066E5',
    decorationOrange: '#F3A47D',
    decorationYellow: '#F5C966',
    decorationMint: '#55B9A7',
  },
  dark: {
    text: '#F5F7FA',
    background: '#101317',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#BAC4CE',
    accent: '#70D5BC',
    accentHover: '#83DEC7',
    accentPressed: '#5FC4AC',
    accentText: '#102F32',
    accentShadow: '#3E927F',
    focusRing: '#A997FF',
    decorationPurple: '#A28EFF',
    decorationOrange: '#FFB28C',
    decorationYellow: '#F7D477',
    decorationMint: '#70CEBB',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

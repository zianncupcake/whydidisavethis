/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4C6EF5';
const tintColorDark = '#4C6EF5';

export const Colors = {
  light: {
    text: '#2D3748',
    textSecondary: '#718096',
    textMuted: '#A0AEC0',
    background: '#F5F7FA',
    cardBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    placeholderBackground: '#F7FAFC',
    tint: tintColorLight,
    primary: tintColorLight,
    border: '#E2E8F0',
    error: '#E53E3E',
    errorBackground: '#FFF5F5',
    errorBorder: '#FEB2B2',
    tagBackground: '#EBF4FF',
    suggestedBackground: '#F7FAFC',
    icon: '#718096',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E5E5E5',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    background: '#171717',
    cardBackground: '#262626',
    inputBackground: '#262626',
    placeholderBackground: '#404040',
    tint: tintColorDark,
    primary: tintColorDark,
    border: '#404040',
    error: '#FC8181',
    errorBackground: '#2D1B1B',
    errorBorder: '#E53E3E',
    tagBackground: '#1E293B',
    suggestedBackground: '#404040',
    icon: '#A3A3A3',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorDark,
  },
};

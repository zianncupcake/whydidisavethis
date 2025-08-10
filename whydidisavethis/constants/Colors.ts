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
    text: '#E2E8F0',
    textSecondary: '#A0AEC0',
    textMuted: '#718096',
    background: '#1A202C',
    cardBackground: '#2D3748',
    inputBackground: '#2D3748',
    placeholderBackground: '#4A5568',
    tint: tintColorDark,
    primary: tintColorDark,
    border: '#4A5568',
    error: '#FC8181',
    errorBackground: '#2D1B1B',
    errorBorder: '#E53E3E',
    tagBackground: '#2A4A7A',
    suggestedBackground: '#4A5568',
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorDark,
  },
};

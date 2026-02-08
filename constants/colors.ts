export interface ThemeColors {
  background: string;
  card: string;
  cardAlt: string;
  primary: string;
  primaryLight: string;
  primarySoft: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
  success: string;
  error: string;
  warning: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightColors: ThemeColors = {
  background: '#FBF8F4',
  card: '#FFFFFF',
  cardAlt: '#F7F3EE',
  primary: '#C67C4E',
  primaryLight: '#E8C4A8',
  primarySoft: '#F2DED5',
  secondary: '#8B9E7E',
  secondaryLight: '#E8EDE4',
  accent: '#E8B86D',
  accentLight: '#F5E6CC',
  text: '#2D2A26',
  textSecondary: '#6B6560',
  textMuted: '#A49E98',
  border: '#EDE8E2',
  borderLight: '#F5F1EC',
  white: '#FFFFFF',
  black: '#1A1816',
  success: '#7EB07A',
  error: '#D4726A',
  warning: '#E8B86D',
  overlay: 'rgba(45, 42, 38, 0.5)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#EDE8E2',
  tabBarActive: '#C67C4E',
  tabBarInactive: '#A49E98',
};

export const darkColors: ThemeColors = {
  background: '#1A1816',
  card: '#262320',
  cardAlt: '#2E2A27',
  primary: '#D4915F',
  primaryLight: '#5C4433',
  primarySoft: '#3D2E24',
  secondary: '#8B9E7E',
  secondaryLight: '#2A3326',
  accent: '#E8B86D',
  accentLight: '#3D3224',
  text: '#F0EDE8',
  textSecondary: '#A8A29C',
  textMuted: '#6B6560',
  border: '#3A3633',
  borderLight: '#2E2A27',
  white: '#FFFFFF',
  black: '#0D0C0B',
  success: '#7EB07A',
  error: '#D4726A',
  warning: '#E8B86D',
  overlay: 'rgba(0, 0, 0, 0.65)',
  tabBar: '#1F1C1A',
  tabBarBorder: '#2E2A27',
  tabBarActive: '#D4915F',
  tabBarInactive: '#6B6560',
};

export default lightColors;

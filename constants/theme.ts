/**
 * Universal color system for consistent appearance across all devices
 * Using Tailwind-inspired colors that work well on both iOS and Android
 */

import { Platform } from 'react-native';

// Universal colors that work everywhere
export const UniversalColors = {
  // Primary colors
  primary: '#2563EB',    // Consistent blue that works on all devices
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  
  // Secondary colors
  secondary: '#64748B',  // Versatile slate gray
  secondaryLight: '#94A3B8',
  secondaryDark: '#475569',
  
  // Semantic colors
  success: '#10B981',    // Emerald green
  successLight: '#34D399',
  successDark: '#059669',
  
  error: '#EF4444',      // Red
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  warning: '#F59E0B',    // Amber
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  info: '#3B82F6',       // Blue
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray scale (works in both light and dark modes)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Additional colors for specific use cases
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
};

// Platform-specific adjustments for better consistency
const getPlatformColors = () => {
  if (Platform.OS === 'ios') {
    return {
      tint: UniversalColors.primary,
      systemBlue: '#007AFF',
      systemGray: '#8E8E93',
    };
  }
  
  if (Platform.OS === 'android') {
    return {
      tint: UniversalColors.primary,
      systemBlue: '#2196F3', 
      systemGray: '#757575',
    };
  }
  
  // Default for web and other platforms
  return {
    tint: UniversalColors.primary,
    systemBlue: UniversalColors.primary,
    systemGray: UniversalColors.gray500,
  };
};

const platformColors = getPlatformColors();

export const Colors = {
  light: {
    // Core colors
    text: UniversalColors.gray900,
    background: UniversalColors.white,
    tint: platformColors.tint,
    
    // UI elements
    card: UniversalColors.gray50,
    border: UniversalColors.gray200,
    inputBackground: UniversalColors.white,
    
    // Tab bar
    tabIconDefault: UniversalColors.gray500,
    tabIconSelected: platformColors.tint,
    
    // Icons
    icon: UniversalColors.gray600,
    iconSelected: platformColors.tint,
    
    // Status and notifications
    notification: UniversalColors.error,
    success: UniversalColors.success,
    error: UniversalColors.error,
    warning: UniversalColors.warning,
    
    // Glassmorphism effects
    glassBackground: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
  },
  dark: {
    // Core colors  
    text: UniversalColors.white,
    background: UniversalColors.gray900,
    tint: platformColors.tint,
    
    // UI elements
    card: UniversalColors.gray800,
    border: UniversalColors.gray700,
    inputBackground: UniversalColors.gray800,
    
    // Tab bar
    tabIconDefault: UniversalColors.gray400,
    tabIconSelected: platformColors.tint,
    
    // Icons
    icon: UniversalColors.gray400,
    iconSelected: platformColors.tint,
    
    // Status and notifications
    notification: UniversalColors.error,
    success: UniversalColors.success,
    error: UniversalColors.error,
    warning: UniversalColors.warning,
    
    // Glassmorphism effects
    glassBackground: 'rgba(30, 30, 30, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

// Emotion-specific colors (for your emotion recognition features)
export const EmotionColors = {
  happy: UniversalColors.warning,      // Amber
  sad: UniversalColors.info,           // Blue
  angry: UniversalColors.error,        // Red
  neutral: UniversalColors.gray500,    // Gray
  calm: UniversalColors.success,       // Green
  fearful: UniversalColors.secondary,  // Slate
  disgust: UniversalColors.success,    // Green (lighter shade)
  surprised: UniversalColors.warning,  // Amber (different context)
  uncertain: UniversalColors.gray400,  // Light gray for low confidence
};

// Helper function to get emotion color with opacity
export const getEmotionColor = (emotion: string, opacity: number = 1): string => {
  const baseColor = EmotionColors[emotion.toLowerCase() as keyof typeof EmotionColors] || UniversalColors.gray500;
  
  if (opacity === 1) return baseColor;
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Font configurations (keeping your existing fonts)
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif', 
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Export type for TypeScript
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;
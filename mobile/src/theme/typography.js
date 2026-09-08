import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular:   'Inter-Regular',
    medium:    'Inter-Medium',
    semiBold:  'Inter-SemiBold',
    bold:      'Inter-Bold',
  },
  android: {
    regular:   'Inter-Regular',
    medium:    'Inter-Medium',
    semiBold:  'Inter-SemiBold',
    bold:      'Inter-Bold',
  },
  default: {
    regular:   'System',
    medium:    'System',
    semiBold:  'System',
    bold:      'System',
  },
});

export const typography = {
  fontFamily,

  // Font Sizes
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Line Heights
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight:  -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1.0,
    widest:  2.0,
  },

  // Pre-built text style presets
  preset: {
    heading1: {
      fontFamily: fontFamily.bold,
      fontSize: 32,
      letterSpacing: -0.5,
      lineHeight: 38,
    },
    heading2: {
      fontFamily: fontFamily.bold,
      fontSize: 24,
      letterSpacing: -0.3,
      lineHeight: 30,
    },
    heading3: {
      fontFamily: fontFamily.semiBold,
      fontSize: 20,
      letterSpacing: -0.2,
      lineHeight: 26,
    },
    subheading: {
      fontFamily: fontFamily.semiBold,
      fontSize: 16,
      lineHeight: 22,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 15,
      lineHeight: 22,
    },
    bodyMedium: {
      fontFamily: fontFamily.medium,
      fontSize: 15,
      lineHeight: 22,
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      lineHeight: 18,
    },
    label: {
      fontFamily: fontFamily.semiBold,
      fontSize: 11,
      letterSpacing: 1.0,
      textTransform: 'uppercase',
    },
  },
};

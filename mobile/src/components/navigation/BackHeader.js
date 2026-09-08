import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

/**
 * Reusable screen header with optional back button.
 * @param {string} title
 * @param {boolean} showBack
 * @param {React.ReactNode} rightAction - optional right side element
 * @param {boolean} transparent - don't render background
 */
export default function BackHeader({ title, subtitle, showBack = true, rightAction, transparent = false }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerContainer, transparent && styles.transparent, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {/* Back Button */}
        <View style={styles.leftSlot}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Right Action */}
        <View style={styles.rightSlot}>
          {rightAction || <View style={styles.placeholder} />}
        </View>
      </View>

      {/* Subtle divider */}
      {!transparent && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    zIndex: 10,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: theme.spacing[3],
  },
  leftSlot: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.size.md,
    color: theme.colors.textPrimary,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    lineHeight: 22,
  },
  placeholder: {
    width: 36,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing[3],
    marginHorizontal: -theme.spacing[4],
  },
});

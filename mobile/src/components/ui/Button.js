import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

/**
 * Reusable Button component
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  style,
  textStyle,
}) {
  const sizeStyles = {
    sm: { height: 36, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.size.sm },
    md: { height: 48, paddingHorizontal: theme.spacing[6], fontSize: theme.typography.size.base },
    lg: { height: 56, paddingHorizontal: theme.spacing[8], fontSize: theme.typography.size.md },
  };
  const sz = sizeStyles[size];
  const opacity = disabled || loading ? 0.55 : 1;

  const content = (
    <View style={[styles.inner, { gap: theme.spacing[2] }]}>
      {icon && !loading && icon}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary.main : theme.colors.white}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { fontSize: sz.fontSize },
          variant === 'outline' || variant === 'ghost'
            ? { color: theme.colors.primary.main }
            : variant === 'danger'
            ? { color: theme.colors.white }
            : { color: theme.colors.white },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconRight && !loading && iconRight}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.82}
        style={[{ opacity }, style]}
      >
        <LinearGradient
          colors={theme.colors.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height: sz.height, paddingHorizontal: sz.paddingHorizontal }, theme.shadow.glow]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle = {
    secondary: { backgroundColor: theme.colors.secondary.main },
    outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary.main },
    ghost:     { backgroundColor: 'transparent' },
    danger:    { backgroundColor: theme.colors.error },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[styles.base, variantStyle[variant], { height: sz.height, paddingHorizontal: sz.paddingHorizontal, opacity }, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
});

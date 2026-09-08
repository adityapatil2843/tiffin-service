import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

// Custom toast types: 'success', 'error', 'warning', 'info'
const ToastBase = ({ type, text1, text2 }) => {
  const config = {
    success: { bg: theme.colors.successBg, border: theme.colors.success, icon: '✓', color: theme.colors.success },
    error:   { bg: theme.colors.errorBg,   border: theme.colors.error,   icon: '✕', color: theme.colors.error },
    warning: { bg: theme.colors.warningBg, border: theme.colors.warning, icon: '⚠', color: theme.colors.warning },
    info:    { bg: theme.colors.infoBg,    border: theme.colors.info,    icon: 'ℹ', color: theme.colors.info },
  };

  const t = config[type] || config.info;

  return (
    <View style={[styles.container, { backgroundColor: t.bg, borderLeftColor: t.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: t.border + '33' }]}>
        <Text style={[styles.icon, { color: t.color }]}>{t.icon}</Text>
      </View>
      <View style={styles.textContainer}>
        {text1 ? (
          <Text style={[styles.title, { color: t.color }]} numberOfLines={1}>{text1}</Text>
        ) : null}
        {text2 ? (
          <Text style={styles.message} numberOfLines={2}>{text2}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderLeftWidth: 4,
    gap: theme.spacing[3],
    minHeight: 60,
    ...theme.shadow.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.size.base,
    lineHeight: 20,
  },
  message: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});

// Config object passed to the Toast component in _layout.js
export const toastConfig = {
  success: (props) => <ToastBase type="success" {...props} />,
  error:   (props) => <ToastBase type="error" {...props} />,
  warning: (props) => <ToastBase type="warning" {...props} />,
  info:    (props) => <ToastBase type="info" {...props} />,
};

export default ToastBase;

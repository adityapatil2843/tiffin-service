import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const typeConfig = {
  success:        { bg: theme.colors.successBg, text: theme.colors.success },
  error:          { bg: theme.colors.errorBg,   text: theme.colors.error },
  warning:        { bg: theme.colors.warningBg, text: theme.colors.warning },
  info:           { bg: theme.colors.infoBg,    text: theme.colors.info },
  pending:        { bg: 'rgba(253,203,110,0.15)', text: theme.colors.warning },
  approved:       { bg: theme.colors.successBg, text: theme.colors.success },
  rejected:       { bg: theme.colors.errorBg,   text: theme.colors.error },
  paid:           { bg: theme.colors.successBg, text: theme.colors.success },
  partially_paid: { bg: 'rgba(116,185,255,0.15)', text: theme.colors.info },
  delivered:      { bg: theme.colors.successBg, text: theme.colors.success },
  cancelled:      { bg: theme.colors.errorBg,   text: theme.colors.error },
  scheduled:      { bg: theme.colors.infoBg,    text: theme.colors.info },
  veg:            { bg: 'rgba(0,184,148,0.12)', text: theme.colors.success },
  'non-veg':      { bg: theme.colors.errorBg,   text: theme.colors.error },
};

export default function Badge({ label, type = 'info', size = 'sm', style }) {
  const config = typeConfig[type] || typeConfig.info;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall ? styles.small : styles.medium,
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.text }, isSmall ? styles.textSm : styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontFamily: theme.typography.fontFamily.semiBold,
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

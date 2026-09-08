import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  icon,
  iconRight,
  onIconRightPress,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  editable = true,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? theme.colors.error
    : focused
    ? theme.colors.primary.main
    : theme.colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.container, { borderColor }]}>
        {icon ? <View style={styles.iconLeft}>{icon}</View> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            icon && { paddingLeft: 0 },
            multiline && { height: numberOfLines ? numberOfLines * 22 + 20 : 100, textAlignVertical: 'top' },
            !editable && { color: theme.colors.textMuted },
            inputStyle,
          ]}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />

        {secureTextEntry ? (
          <TouchableOpacity style={styles.iconRight} onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        ) : iconRight ? (
          <TouchableOpacity style={styles.iconRight} onPress={onIconRightPress}>
            {iconRight}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing[2],
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing[4],
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
  error: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.error,
  },
});

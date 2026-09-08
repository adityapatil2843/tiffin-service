import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

/**
 * Premium custom tab bar shared across all roles.
 * Renders label + icon with animated active indicator dot.
 */
export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + (Platform.OS === 'android' ? 8 : 4) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: isFocused ? theme.colors.tabActive : theme.colors.tabInactive, size: 22 }) : null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.75}
          >
            {/* Active indicator dot */}
            <View style={styles.iconWrapper}>
              {isFocused && <View style={styles.activePill} />}
              {icon}
            </View>
            <Text
              style={[
                styles.label,
                { color: isFocused ? theme.colors.tabActive : theme.colors.tabInactive },
                isFocused && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    ...theme.shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing[1],
    gap: theme.spacing[1],
  },
  iconWrapper: {
    position: 'relative',
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 2,
    width: 36,
    height: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary.main + '20', // 12% opacity
    zIndex: 0,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});

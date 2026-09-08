import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useMenuStore } from '../../../src/store/menuStore';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import Avatar from '../../../src/components/ui/Avatar';
import EmptyState from '../../../src/components/ui/EmptyState';

const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function UserHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { todaysMenu, weeklyMenu, isLoading, fetchTodaysMenu, fetchWeeklyMenu } = useMenuStore();

  useEffect(() => { 
    fetchTodaysMenu(); 
    fetchWeeklyMenu();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { fetchTodaysMenu(); fetchWeeklyMenu(); }}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        {/* ── HEADER ── */}
        <LinearGradient
          colors={['#1E2A45', theme.colors.background]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Friend'} 👋</Text>
            </View>
            <Avatar name={user?.name} uri={user?.profileImage} size={48} />
          </View>

          {/* Subscription Status Card */}
          <View style={styles.subscriptionBanner}>
            <View style={styles.subRow}>
              <View>
                <Text style={styles.subLabel}>SUBSCRIPTION</Text>
                <Text style={styles.subPlan}>{user?.planType?.toUpperCase() || 'MONTHLY'} PLAN</Text>
              </View>
              <Badge
                label={user?.subscriptionStatus || 'active'}
                type={user?.subscriptionStatus === 'active' ? 'success' : 'warning'}
                size="md"
              />
            </View>
            <View style={styles.subRow}>
              <View style={styles.subStat}>
                <Text style={styles.subStatValue}>{user?.userId || '—'}</Text>
                <Text style={styles.subStatLabel}>Your ID</Text>
              </View>
              <View style={styles.subDivider} />
              <View style={styles.subStat}>
                <Text style={[styles.subStatValue, { color: theme.colors.primary.main }]}>
                  {user?.dietType === 'veg' ? '🥗 Veg' : '🍖 Non-Veg'}
                </Text>
                <Text style={styles.subStatLabel}>Diet Type</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── TODAY'S MENU ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Menu</Text>
          <Text style={styles.sectionSubtitle}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 32 }} />
          ) : todaysMenu.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No menu today"
              subtitle="Your tiffin service hasn't added today's menu yet."
            />
          ) : (
            <View style={styles.menuList}>
              {todaysMenu.map((menu) => (
                <Card key={menu._id} style={styles.menuCard}>
                  <View style={styles.menuHeader}>
                    <Text style={styles.mealType}>
                      {MEAL_EMOJI[menu.mealType]} {menu.mealType.charAt(0).toUpperCase() + menu.mealType.slice(1)}
                    </Text>
                    {menu.isTodaysSpecial && (
                      <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>⭐ Today's Special</Text>
                      </View>
                    )}
                  </View>

                  {menu.specialNote ? (
                    <Text style={styles.specialNote}>{menu.specialNote}</Text>
                  ) : null}

                  <View style={styles.itemsList}>
                    {menu.items?.map((item, idx) => (
                      <View key={item._id || idx} style={styles.itemRow}>
                        <View style={[
                          styles.dietDot,
                          { backgroundColor: item.category === 'vegetarian' ? theme.colors.success : theme.colors.error }
                        ]} />
                        <Text style={styles.itemName}>{item.name}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Rating */}
                  {menu.totalRatings > 0 && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={theme.colors.gold} />
                      <Text style={styles.ratingText}>
                        {menu.averageRating?.toFixed(1)} ({menu.totalRatings} ratings)
                      </Text>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* ── UPCOMING WEEK ── */}
        <View style={[styles.section, { paddingTop: 0 }]}>
          <Text style={styles.sectionTitle}>Upcoming This Week</Text>
          <Text style={styles.sectionSubtitle}>Plan your tiffins in advance</Text>

          {weeklyMenu.length === 0 && !isLoading ? (
            <Text style={{ color: theme.colors.textMuted, fontStyle: 'italic', fontSize: 13, marginTop: 8 }}>
              No upcoming menus planned by your service yet.
            </Text>
          ) : (
            <View style={styles.menuList}>
              {weeklyMenu.map((menu) => {
                // Skip today's menu in the weekly preview if it's already shown above
                const isToday = new Date(menu.date).toDateString() === new Date().toDateString();
                if (isToday) return null;

                return (
                  <Card key={menu._id} style={{ marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textPrimary, textTransform: 'capitalize' }}>
                        {MEAL_EMOJI[menu.mealType]} {menu.mealType}
                      </Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                        {new Date(menu.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <View style={{ gap: 4 }}>
                      {menu.items.map(item => (
                        <Text key={item._id} style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                          • {item.name}
                        </Text>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[5], paddingTop: theme.spacing[4] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[4] },
  greeting: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.base, color: theme.colors.textMuted },
  userName: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary, marginTop: 2 },
  subscriptionBanner: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: theme.spacing[4], borderWidth: 1, borderColor: theme.colors.cardBorder, gap: theme.spacing[4] },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subLabel: { ...theme.typography.preset.label, color: theme.colors.textMuted, fontSize: 10 },
  subPlan: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.lg, color: theme.colors.textPrimary, marginTop: 2 },
  subStat: { alignItems: 'center', flex: 1 },
  subStatValue: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.md, color: theme.colors.textPrimary },
  subStatLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.xs, color: theme.colors.textMuted, marginTop: 2 },
  subDivider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  section: { paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[6], paddingBottom: theme.spacing[8] },
  sectionTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.xl, color: theme.colors.textPrimary },
  sectionSubtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2, marginBottom: theme.spacing[4] },
  menuList: { gap: theme.spacing[4] },
  menuCard: { gap: theme.spacing[3] },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealType: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.md, color: theme.colors.textPrimary },
  specialBadge: { backgroundColor: theme.colors.gold + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  specialText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 11, color: theme.colors.gold },
  specialNote: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, fontStyle: 'italic' },
  itemsList: { gap: theme.spacing[2] },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  dietDot: { width: 8, height: 8, borderRadius: 4 },
  itemName: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
});

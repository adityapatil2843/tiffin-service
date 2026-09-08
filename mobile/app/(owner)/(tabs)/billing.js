import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../src/theme';
import { useBillStore } from '../../../src/store/billStore';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import Avatar from '../../../src/components/ui/Avatar';
import EmptyState from '../../../src/components/ui/EmptyState';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

export default function OwnerBillingScreen() {
  const insets = useSafeAreaInsets();
  const { serviceBills, isLoading, fetchServiceBills } = useBillStore();

  useEffect(() => { fetchServiceBills(now.getMonth() + 1, now.getFullYear()); }, []);

  const fmt = (n) => `₹${(n||0).toLocaleString('en-IN')}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
        <Text style={styles.subtitle}>{MONTHS[now.getMonth()]} {now.getFullYear()} • {serviceBills.length} bills</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchServiceBills(now.getMonth()+1, now.getFullYear())} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && serviceBills.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : serviceBills.length === 0 ? (
          <EmptyState icon="💰" title="No bills this month" subtitle="Generate bills from each user's delivery history." />
        ) : (
          <View style={styles.list}>
            {serviceBills.map((bill) => (
              <Card key={bill._id} style={styles.billCard}>
                <View style={styles.userRow}>
                  <Avatar name={bill.userId?.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{bill.userId?.name}</Text>
                    <Text style={styles.userId}>{bill.userId?.userId}</Text>
                  </View>
                  <Badge label={bill.status.replace('_',' ')} type={bill.status === 'paid' ? 'paid' : bill.status === 'partially_paid' ? 'partially_paid' : 'pending'} size="md" />
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amount}>{fmt(bill.totalAmount)}</Text>
                  {bill.paidAmount > 0 && <Text style={styles.paid}>Paid: {fmt(bill.paidAmount)}</Text>}
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4] },
  title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  subtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2 },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100 },
  list: { gap: theme.spacing[3] },
  billCard: { gap: theme.spacing[3] },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  userName: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  userId: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.xl, color: theme.colors.primary.main },
  paid: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.success },
});

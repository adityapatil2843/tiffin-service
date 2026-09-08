import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../src/theme';
import { useBillStore } from '../../../src/store/billStore';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import EmptyState from '../../../src/components/ui/EmptyState';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function UserBillsScreen() {
  const insets = useSafeAreaInsets();
  const { myBills, isLoading, fetchMyBills } = useBillStore();

  useEffect(() => { fetchMyBills(); }, []);

  const fmt = (n) => `₹${(n||0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bills</Text>
        <Text style={styles.subtitle}>Monthly billing history</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyBills} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && myBills.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : myBills.length === 0 ? (
          <EmptyState icon="💳" title="No bills yet" subtitle="Bills appear here once your service generates them." />
        ) : (
          <View style={styles.list}>
            {myBills.map((bill) => (
              <Card key={bill._id} style={styles.billCard}>
                <View style={styles.billHeader}>
                  <Text style={styles.billMonth}>{MONTHS[bill.month - 1]} {bill.year}</Text>
                  <Badge label={bill.status.replace('_',' ')} type={bill.status === 'paid' ? 'paid' : bill.status === 'partially_paid' ? 'partially_paid' : 'pending'} size="md" />
                </View>
                <Text style={styles.totalAmount}>{fmt(bill.totalAmount)}</Text>
                {bill.paidAmount > 0 && bill.status !== 'paid' && (
                  <Text style={styles.paidLabel}>Paid: {fmt(bill.paidAmount)} • Remaining: {fmt(bill.totalAmount - bill.paidAmount)}</Text>
                )}
                <View style={styles.breakdown}>
                  <View style={styles.bItem}>
                    <Text style={styles.bLabel}>Delivered</Text>
                    <Text style={styles.bValue}>{bill.deliveredDays}d</Text>
                  </View>
                  <View style={styles.bItem}>
                    <Text style={styles.bLabel}>Cancelled</Text>
                    <Text style={[styles.bValue, { color: theme.colors.error }]}>-{fmt(bill.deductions)}</Text>
                  </View>
                  <View style={styles.bItem}>
                    <Text style={styles.bLabel}>Extras</Text>
                    <Text style={[styles.bValue, { color: theme.colors.success }]}>+{fmt(bill.additions)}</Text>
                  </View>
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
  list: { gap: theme.spacing[4] },
  billCard: { gap: theme.spacing[3] },
  billHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billMonth: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.lg, color: theme.colors.textPrimary },
  totalAmount: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['3xl'], color: theme.colors.primary.main },
  paidLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: theme.spacing[3] },
  bItem: { alignItems: 'center', gap: 4 },
  bLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.xs, color: theme.colors.textMuted },
  bValue: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.sm, color: theme.colors.textPrimary },
});

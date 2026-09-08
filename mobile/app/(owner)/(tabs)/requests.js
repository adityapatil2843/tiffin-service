import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import { useTiffinStore } from '../../../src/store/tiffinStore';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';
import Avatar from '../../../src/components/ui/Avatar';

const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function OwnerRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { serviceRequests, isLoading, isSubmitting, fetchServiceRequests, reviewRequest } = useTiffinStore();

  useEffect(() => { fetchServiceRequests(); }, []);

  const handleReview = async (requestId, status) => {
    const result = await reviewRequest(requestId, { status });
    if (result.success) {
      Toast.show({ type: 'success', text1: `Request ${status}!` });
    } else {
      Toast.show({ type: 'error', text1: 'Failed', text2: result.message });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Requests</Text>
        <Text style={styles.subtitle}>{serviceRequests.length} awaiting review</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchServiceRequests} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && serviceRequests.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : serviceRequests.length === 0 ? (
          <EmptyState icon="✅" title="All clear!" subtitle="No pending requests from users right now." />
        ) : (
          <View style={styles.list}>
            {serviceRequests.map((req) => (
              <Card key={req._id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <Avatar name={req.userId?.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqUserName}>{req.userId?.name}</Text>
                    <Text style={styles.reqUserId}>{req.userId?.userId}</Text>
                  </View>
                  <Badge label={req.type} type={req.type === 'extra' ? 'info' : 'warning'} />
                </View>

                <View style={styles.reqDetails}>
                  <Text style={styles.reqMeal}>{MEAL_EMOJI[req.mealType]} {req.mealType}</Text>
                  <Text style={styles.reqDate}>
                    {new Date(req.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                </View>

                {req.reason ? <Text style={styles.reqReason}>"{req.reason}"</Text> : null}

                <View style={styles.actions}>
                  <Button
                    title="Reject"
                    variant="danger"
                    size="sm"
                    onPress={() => handleReview(req._id, 'rejected')}
                    loading={isSubmitting}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Approve"
                    size="sm"
                    onPress={() => handleReview(req._id, 'approved')}
                    loading={isSubmitting}
                    style={{ flex: 1 }}
                  />
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
  reqCard: { gap: theme.spacing[3] },
  reqHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  reqUserName: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  reqUserId: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  reqDetails: { flexDirection: 'row', gap: theme.spacing[4] },
  reqMeal: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, textTransform: 'capitalize' },
  reqDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  reqReason: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: theme.spacing[3] },
});

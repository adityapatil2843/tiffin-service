import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import { useTiffinStore } from '../../../src/store/tiffinStore';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import Button from '../../../src/components/ui/Button';
import EmptyState from '../../../src/components/ui/EmptyState';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function TiffinScreen() {
  const insets = useSafeAreaInsets();
  const { myRequests, isLoading, isSubmitting, fetchMyRequests, submitRequest } = useTiffinStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [requestType, setRequestType] = useState('cancellation');
  const [mealType, setMealType] = useState('lunch');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  useEffect(() => { fetchMyRequests(); }, []);

  const handleSubmit = async () => {
    const result = await submitRequest({ type: requestType, date, mealType, reason });
    if (result.success) {
      Toast.show({ type: 'success', text1: 'Request Submitted!', text2: `Your ${requestType} request has been sent.` });
      setModalVisible(false);
    } else {
      Toast.show({ type: 'error', text1: 'Request Failed', text2: result.message });
    }
  };

  const statusColor = (status) => status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tiffin</Text>
          <Text style={styles.subtitle}>Manage your cancellations & extras</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing[5], paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyRequests} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && myRequests.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : myRequests.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No requests yet"
            subtitle="Submit a cancellation or extra tiffin request."
            action={() => setModalVisible(true)}
            actionLabel="New Request"
          />
        ) : (
          <View style={styles.list}>
            {myRequests.map((req) => (
              <Card key={req._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={{ gap: 4 }}>
                    <Text style={styles.requestMeal}>
                      {MEAL_EMOJI[req.mealType]} {req.mealType.charAt(0).toUpperCase() + req.mealType.slice(1)}
                    </Text>
                    <Text style={styles.requestDate}>
                      {new Date(req.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Badge label={req.type} type={req.type === 'extra' ? 'info' : 'warning'} />
                    <Badge label={req.status} type={statusColor(req.status)} />
                  </View>
                </View>
                {req.reason ? (
                  <Text style={styles.requestReason}>"{req.reason}"</Text>
                ) : null}
                {req.reviewNote ? (
                  <View style={styles.reviewNote}>
                    <Text style={styles.reviewNoteText}>Owner: {req.reviewNote}</Text>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Tiffin Request</Text>

            {/* Request Type Toggle */}
            <View style={styles.typeToggle}>
              {['cancellation', 'extra'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, requestType === t && styles.typeBtnActive]}
                  onPress={() => setRequestType(t)}
                >
                  <Text style={[styles.typeText, requestType === t && styles.typeTextActive]}>
                    {t === 'cancellation' ? '❌ Cancel' : '➕ Extra'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Meal Type */}
            <Text style={styles.fieldLabel}>Meal Type</Text>
            <View style={styles.typeToggle}>
              {MEAL_TYPES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.typeBtn, mealType === m && styles.typeBtnActive]}
                  onPress={() => setMealType(m)}
                >
                  <Text style={[styles.typeText, mealType === m && styles.typeTextActive]}>
                    {MEAL_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Submit" onPress={handleSubmit} loading={isSubmitting} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4] },
  title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  subtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary.main, justifyContent: 'center', alignItems: 'center', ...theme.shadow.glow },
  list: { gap: theme.spacing[3], paddingTop: theme.spacing[2] },
  requestCard: { gap: theme.spacing[3] },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  requestMeal: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  requestDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  requestReason: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, fontStyle: 'italic' },
  reviewNote: { backgroundColor: theme.colors.infoBg, borderRadius: theme.radius.sm, padding: theme.spacing[3] },
  reviewNoteText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.info },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.colors.card, borderTopLeftRadius: theme.radius['2xl'], borderTopRightRadius: theme.radius['2xl'], padding: theme.spacing[6], gap: theme.spacing[4] },
  modalHandle: { width: 40, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: theme.spacing[2] },
  modalTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.xl, color: theme.colors.textPrimary },
  fieldLabel: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary },
  typeToggle: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 4, gap: 4 },
  typeBtn: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.radius.sm, alignItems: 'center' },
  typeBtnActive: { backgroundColor: theme.colors.primary.main },
  typeText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  typeTextActive: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.semiBold },
  modalActions: { flexDirection: 'row', gap: theme.spacing[3], marginTop: theme.spacing[2] },
});

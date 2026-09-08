import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import BackHeader from '../../../src/components/navigation/BackHeader';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';

export default function CreateUserScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    dietType: 'veg', planId: 'plan_1', planType: 'monthly',
    messStartSlot: 'morning',
    line1: '', city: '', pincode: '',
  });

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    const cleanPhone = form.phone.replace(/\D/g, '');
    const cleanPincode = form.pincode.replace(/\D/g, '');

    if (!form.name.trim() || cleanPhone.length !== 10 || !form.password || !form.line1.trim() || !form.city.trim() || cleanPincode.length !== 6) {
      return Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields (10-digit phone, 6-digit pincode)',
      });
    }
    
    setLoading(true);
    try {
      await api.post('/owner/users', {
        name: form.name.trim(),
        phone: cleanPhone,
        email: form.email.trim() || undefined,
        password: form.password,
        dietType: form.dietType,
        planId: form.planId,
        planType: 'monthly',
        subscriptionType: 'monthly',
        messStartDate: new Date().toISOString(),
        messStartSlot: form.messStartSlot,
        deliveryAddress: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          pincode: cleanPincode,
        },
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Subscriber enrolled successfully' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Add New User" subtitle="Create a subscriber account" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Input label="Full Name *" placeholder="e.g. Rahul Sharma" value={form.name} onChangeText={(v) => updateForm('name', v)} />
          <Input label="Phone Number *" placeholder="10-digit mobile number" value={form.phone} onChangeText={(v) => updateForm('phone', v)} keyboardType="phone-pad" />
          <Input label="Email Address" placeholder="Optional email" value={form.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Initial Password *" placeholder="Min 6 chars" value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry />
          
          {/* Plan Selection */}
          <View>
            <Text style={styles.label}>Select Mess Plan *</Text>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, form.planId === 'plan_1' && styles.activePlan]}
                onPress={() => updateForm('planId', 'plan_1')}
              >
                <Text style={[styles.toggleText, form.planId === 'plan_1' && styles.activeText]}>
                  Plan 1 (Basic ₹60)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, form.planId === 'plan_2' && styles.activePlan]}
                onPress={() => updateForm('planId', 'plan_2')}
              >
                <Text style={[styles.toggleText, form.planId === 'plan_2' && styles.activeText]}>
                  Plan 2 (Full ₹80)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Diet Preference */}
          <View>
            <Text style={styles.label}>Dietary Preference</Text>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, form.dietType === 'veg' && styles.activeVeg]}
                onPress={() => updateForm('dietType', 'veg')}
              >
                <Text style={[styles.toggleText, form.dietType === 'veg' && styles.activeText]}>🥗 Pure Veg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, form.dietType === 'non-veg' && styles.activeNonVeg]}
                onPress={() => updateForm('dietType', 'non-veg')}
              >
                <Text style={[styles.toggleText, form.dietType === 'non-veg' && styles.activeText]}>🍖 Non-Veg</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Input label="Delivery Address Line 1 *" placeholder="House No, Building, Street" value={form.line1} onChangeText={(v) => updateForm('line1', v)} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="City *" placeholder="City" value={form.city} onChangeText={(v) => updateForm('city', v)} /></View>
            <View style={{ flex: 1 }}><Input label="Pincode *" placeholder="6-digit PIN" value={form.pincode} onChangeText={(v) => updateForm('pincode', v)} keyboardType="numeric" /></View>
          </View>
          
          <Button title="Create User" onPress={handleSubmit} loading={loading} style={{ marginTop: theme.spacing[4] }} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: 100 },
  row: { flexDirection: 'row', gap: theme.spacing[4] },
  label: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing[2] },
  toggle: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  activePlan: { backgroundColor: theme.colors.primary.main },
  activeVeg: { backgroundColor: theme.colors.success },
  activeNonVeg: { backgroundColor: theme.colors.error },
  activeText: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.semiBold },
});

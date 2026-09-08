import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import BackHeader from '../../../src/components/navigation/BackHeader';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    dietType: 'veg', planType: 'monthly', status: 'active',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/owner/users');
        const found = res.data.data.users.find(u => u._id === id);
        if (found) {
          setUser(found);
          setForm({
            name: found.name, phone: found.phone, email: found.email || '',
            dietType: found.dietType, planType: found.planType, status: found.status
          });
        }
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Error fetching user' });
      } finally { setLoading(false); }
    };
    fetchUser();
  }, [id]);

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/owner/users/${id}`, form);
      Toast.show({ type: 'success', text1: 'User Updated' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Something went wrong' });
    } finally { setSaving(false); }
  };

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={theme.colors.primary.main} /></View>;
  }

  if (!user) {
    return <View style={styles.container}><BackHeader title="Not Found" /><Text style={styles.errorText}>User not found.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <BackHeader title="Edit User" subtitle={user.userId} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Input label="Full Name" value={form.name} onChangeText={(v) => updateForm('name', v)} />
            <Input label="Phone Number" value={form.phone} onChangeText={(v) => updateForm('phone', v)} keyboardType="phone-pad" />
            <Input label="Email" value={form.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Diet Type</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity style={[styles.toggleBtn, form.dietType === 'veg' && styles.activeVeg]} onPress={() => updateForm('dietType', 'veg')}>
                    <Text style={[styles.toggleText, form.dietType === 'veg' && styles.activeText]}>Veg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toggleBtn, form.dietType === 'non-veg' && styles.activeError]} onPress={() => updateForm('dietType', 'non-veg')}>
                    <Text style={[styles.toggleText, form.dietType === 'non-veg' && styles.activeText]}>Non-Veg</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity style={[styles.toggleBtn, form.status === 'active' && styles.activeVeg]} onPress={() => updateForm('status', 'active')}>
                    <Text style={[styles.toggleText, form.status === 'active' && styles.activeText]}>Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toggleBtn, form.status === 'inactive' && styles.activeError]} onPress={() => updateForm('status', 'inactive')}>
                    <Text style={[styles.toggleText, form.status === 'inactive' && styles.activeText]}>Inactive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Button title="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: theme.spacing[4] }} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing[5], gap: theme.spacing[6], paddingBottom: 100 },
  section: { gap: theme.spacing[4] },
  sectionTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  row: { flexDirection: 'row', gap: theme.spacing[4] },
  label: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing[2] },
  toggle: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  activeVeg: { backgroundColor: theme.colors.success },
  activeError: { backgroundColor: theme.colors.error },
  activeText: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.semiBold },
  errorText: { color: theme.colors.error, textAlign: 'center', marginTop: 40 },
});

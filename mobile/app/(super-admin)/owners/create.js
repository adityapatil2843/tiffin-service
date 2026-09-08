import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import BackHeader from '../../../src/components/navigation/BackHeader';
import Input from '../../../src/components/ui/Input';
import Button from '../../../src/components/ui/Button';

export default function CreateOwnerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', prefix: '', serviceName: ''
  });

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.password || !form.prefix || !form.serviceName) {
      return Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
    }
    
    setLoading(true);
    try {
      await api.post('/super-admin/owners', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        servicePrefix: form.prefix.toUpperCase(),
        serviceName: form.serviceName
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Owner and Service created successfully' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Add New Owner" subtitle="Create an owner and their tiffin service" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Input label="Owner Full Name *" placeholder="e.g. Rahul Sharma" value={form.name} onChangeText={(v) => updateForm('name', v)} />
          <Input label="Owner Email *" placeholder="Used for login" value={form.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Owner Phone *" placeholder="10-digit mobile number" value={form.phone} onChangeText={(v) => updateForm('phone', v)} keyboardType="phone-pad" />
          <Input label="Owner Password *" placeholder="Min 6 chars" value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry />
          
          <Input label="Tiffin Service Name *" placeholder="e.g. Annapurna Tiffins" value={form.serviceName} onChangeText={(v) => updateForm('serviceName', v)} style={{ marginTop: theme.spacing[4] }} />
          <Input label="User ID Prefix *" placeholder="e.g. AP (2-4 letters)" value={form.prefix} onChangeText={(v) => updateForm('prefix', v)} autoCapitalize="characters" />
          
          <Button title="Create Owner & Service" onPress={handleSubmit} loading={loading} style={{ marginTop: theme.spacing[4] }} size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: 100 },
});

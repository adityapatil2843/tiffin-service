import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import Avatar from '../../../src/components/ui/Avatar';
import EmptyState from '../../../src/components/ui/EmptyState';

export default function OwnerUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/owner/users');
      setUsers(res.data.data.users);
    } catch (e) {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Users</Text>
          <Text style={styles.subtitle}>{users.length} subscribers</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(owner)/users/create')} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchUsers} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && users.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No users yet" subtitle="Add your first tiffin subscriber." action={() => router.push('/(owner)/users/create')} actionLabel="Add User" />
        ) : (
          <View style={styles.list}>
            {users.map((user) => (
              <TouchableOpacity key={user._id} onPress={() => router.push(`/(owner)/users/${user._id}`)} activeOpacity={0.8}>
                <Card style={styles.userCard}>
                  <View style={styles.userRow}>
                    <Avatar name={user.name} uri={user.profileImage} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userId}>{user.userId} • {user.phone}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Badge label={user.status} type={user.status === 'active' ? 'success' : 'error'} />
                      <Badge label={user.dietType} type={user.dietType === 'veg' ? 'veg' : 'non-veg'} />
                    </View>
                  </View>
                  <View style={styles.planRow}>
                    <Ionicons name="calendar-outline" size={13} color={theme.colors.textMuted} />
                    <Text style={styles.planText}>{user.planType} plan</Text>
                    <Text style={styles.planText}>•</Text>
                    <Text style={styles.planText}>{user.subscriptionStatus}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4] },
  title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  subtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary.main, justifyContent: 'center', alignItems: 'center', ...theme.shadow.glow },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100 },
  list: { gap: theme.spacing[3] },
  userCard: { gap: theme.spacing[3] },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  userName: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  userId: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  planText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.xs, color: theme.colors.textMuted, textTransform: 'capitalize' },
});

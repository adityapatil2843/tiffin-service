import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import Card from '../../../src/components/ui/Card';
import Button from '../../../src/components/ui/Button';
import Input from '../../../src/components/ui/Input';
import Badge from '../../../src/components/ui/Badge';
import EmptyState from '../../../src/components/ui/EmptyState';

export default function OwnerMenuScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' or 'items'
  
  // States
  const [items, setItems] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('vegetarian');

  // New Menu Form
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuMeal, setMenuMeal] = useState('lunch');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, menuRes] = await Promise.all([
        api.get('/menu/items'),
        api.get('/menu/week')
      ]);
      setItems(itemsRes.data.data.items);
      setWeeklyMenu(menuRes.data.data.menus);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load menu data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/menu/items', { name: newItemName, category: newItemCategory });
      setItems([...items, res.data.data.menuItem]);
      setNewItemName('');
      Toast.show({ type: 'success', text1: 'Dish added' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to add dish' });
    } finally { setIsSubmitting(false); }
  };

  const handleCreateMenu = async () => {
    if (selectedItems.length === 0) {
      return Toast.show({ type: 'error', text1: 'Select at least one dish' });
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/menu', {
        date: menuDate,
        mealType: menuMeal,
        items: selectedItems
      });
      setWeeklyMenu([...weeklyMenu, res.data.data.menu]);
      setSelectedItems([]);
      Toast.show({ type: 'success', text1: 'Menu planned successfully!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to plan menu', text2: e.response?.data?.message });
    } finally { setIsSubmitting(false); }
  };

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'plan' && styles.activeTab]} onPress={() => setActiveTab('plan')}>
            <Text style={[styles.tabText, activeTab === 'plan' && styles.activeTabText]}>Daily Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'items' && styles.activeTab]} onPress={() => setActiveTab('items')}>
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>Dishes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} tintColor={theme.colors.primary.main} />}
      >
        {activeTab === 'items' ? (
          <View style={styles.section}>
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Add New Dish</Text>
              <Input placeholder="e.g. Paneer Butter Masala" value={newItemName} onChangeText={setNewItemName} />
              <View style={styles.row}>
                <TouchableOpacity style={[styles.typeBtn, newItemCategory === 'vegetarian' && styles.vegActive]} onPress={() => setNewItemCategory('vegetarian')}>
                  <Text style={[styles.typeText, newItemCategory === 'vegetarian' && {color: 'white'}]}>Veg</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, newItemCategory === 'non-vegetarian' && styles.nonVegActive]} onPress={() => setNewItemCategory('non-vegetarian')}>
                  <Text style={[styles.typeText, newItemCategory === 'non-vegetarian' && {color: 'white'}]}>Non-Veg</Text>
                </TouchableOpacity>
              </View>
              <Button title="Add Dish" onPress={handleCreateItem} loading={isSubmitting} disabled={!newItemName.trim()} />
            </Card>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Your Dishes ({items.length})</Text>
            {items.map(item => (
              <View key={item._id} style={styles.itemRow}>
                <View style={[styles.dot, { backgroundColor: item.category === 'vegetarian' ? theme.colors.success : theme.colors.error }]} />
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Plan Menu</Text>
              <Input label="Date (YYYY-MM-DD)" value={menuDate} onChangeText={setMenuDate} />
              
              <Text style={styles.label}>Meal Type</Text>
              <View style={styles.row}>
                {['breakfast', 'lunch', 'dinner'].map(m => (
                  <TouchableOpacity key={m} style={[styles.typeBtn, menuMeal === m && styles.primaryActive]} onPress={() => setMenuMeal(m)}>
                    <Text style={[styles.typeText, menuMeal === m && {color: 'white', textTransform: 'capitalize'}]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Select Dishes</Text>
              {items.length === 0 ? (
                <Text style={styles.emptyText}>Add dishes from the Dishes tab first.</Text>
              ) : (
                <View style={styles.pillContainer}>
                  {items.map(item => {
                    const isSelected = selectedItems.includes(item._id);
                    return (
                      <TouchableOpacity key={item._id} style={[styles.pill, isSelected && styles.pillSelected]} onPress={() => toggleItemSelection(item._id)}>
                        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              
              <Button title="Save Menu" onPress={handleCreateMenu} loading={isSubmitting} disabled={selectedItems.length === 0} style={{ marginTop: 8 }} />
            </Card>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>This Week's Plan</Text>
            {weeklyMenu.length === 0 ? (
              <EmptyState icon="🍱" title="No menus planned" subtitle="Plan your upcoming meals above." />
            ) : (
              weeklyMenu.map(menu => (
                <Card key={menu._id} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textPrimary, textTransform: 'capitalize' }}>{menu.mealType}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{new Date(menu.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    {menu.items.map(item => (
                      <Text key={item._id} style={{ color: theme.colors.textSecondary, fontSize: 14 }}>• {item.name}</Text>
                    ))}
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4], gap: theme.spacing[4] },
  title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  tabs: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: theme.radius.sm },
  activeTab: { backgroundColor: theme.colors.primary.main },
  tabText: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textMuted },
  activeTabText: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.semiBold },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100 },
  section: { gap: theme.spacing[3] },
  formCard: { gap: theme.spacing[3] },
  sectionTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.lg, color: theme.colors.textPrimary },
  label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary },
  row: { flexDirection: 'row', gap: theme.spacing[2] },
  typeBtn: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, paddingVertical: 10, alignItems: 'center' },
  typeText: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textSecondary, textTransform: 'capitalize' },
  vegActive: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  nonVegActive: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
  primaryActive: { backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, padding: theme.spacing[4], borderRadius: theme.radius.md, gap: theme.spacing[3] },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemName: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary },
  emptyText: { color: theme.colors.textMuted, fontStyle: 'italic', fontSize: 13 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  pillSelected: { backgroundColor: theme.colors.primary.main + '20', borderColor: theme.colors.primary.main },
  pillText: { color: theme.colors.textSecondary, fontSize: 13 },
  pillTextSelected: { color: theme.colors.primary.main, fontFamily: theme.typography.fontFamily.semiBold },
});

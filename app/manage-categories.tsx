// Category Management Screen - Add, Edit, and Delete categories

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTransactions } from '../hooks';
import { Button } from '../components/common';
import { Category, TransactionType } from '../types';
import { typography, borderRadius, spacing } from '../constants/theme';

const PRESET_COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336',
  '#00BCD4', '#E91E63', '#3F51B5', '#009688', '#FFC107',
  '#795548', '#607D8B', '#8BC34A', '#03A9F4', '#673AB7',
];

export default function ManageCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    categories,
    expenseCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useTransactions();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(PRESET_COLORS[0]);
  const [categoryIcon, setCategoryIcon] = useState('ellipse');

  const displayCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setCategoryIcon('ellipse');
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryIcon(category.icon);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!categoryName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a category name');
      } else {
        Alert.alert('Error', 'Please enter a category name');
      }
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryName.trim(),
        color: categoryColor,
        icon: categoryIcon,
      });
    } else {
      addCategory({
        name: categoryName.trim(),
        type: activeTab,
        color: categoryColor,
        icon: categoryIcon,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (category: Category) => {
    const performDelete = () => {
      deleteCategory(category.id);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${category.name}"? Transactions using this category will show as "Unknown".`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.name}"? Transactions using this category will show as "Unknown".`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Manage Categories</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Tabs */}
      <View style={styles.tabContainer}>
        {(['expense', 'income'] as TransactionType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tab,
              activeTab === type && { backgroundColor: theme.colors.primary },
              activeTab !== type && { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={() => setActiveTab(type)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === type ? '#ffffff' : theme.colors.textSecondary },
              ]}
            >
              {type === 'expense' ? 'Expense' : 'Income'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {displayCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No {activeTab} categories yet
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={openAddModal}
            >
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryItem, { backgroundColor: theme.colors.card }]}
              onPress={() => openEditModal(category)}
            >
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryName, { color: theme.colors.text }]} numberOfLines={1}>
                {category.name}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(category)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Category Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Category Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                  },
                ]}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="e.g., Groceries"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>

            {/* Color Selection */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Color
              </Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      categoryColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setCategoryColor(color)}
                  >
                    {categoryColor === color && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Preview
              </Text>
              <View style={[styles.previewItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={[styles.previewColor, { backgroundColor: categoryColor }]} />
                <Text style={[styles.previewText, { color: theme.colors.text }]}>
                  {categoryName || 'Category Name'}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <Button
              title={editingCategory ? 'Save Changes' : 'Add Category'}
              onPress={handleSave}
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  deleteButton: {
    padding: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    fontSize: typography.fontSize.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
  },
  previewColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  previewText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});

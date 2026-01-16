// Edit Transaction Screen - View, Edit, and Delete transactions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTransactions } from '../hooks';
import { Button, Input } from '../components/common';
import { TransactionType } from '../types';
import { typography, borderRadius } from '../constants/theme';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

export default function EditTransactionScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    accounts,
    expenseCategories,
    incomeCategories
  } = useTransactions();

  const transaction = id ? getTransactionById(id) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setDescription(transaction.description);
      setSelectedCategory(transaction.categoryId);
      setSelectedAccount(transaction.accountId);
      setDate(format(new Date(transaction.date), 'yyyy-MM-dd'));
      setNotes(transaction.notes || '');
    }
  }, [transaction]);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = () => {
    if (!id || !amount || !description || !selectedCategory) {
      return;
    }

    updateTransaction(id, {
      type,
      amount,
      description,
      categoryId: selectedCategory,
      accountId: selectedAccount,
      date: new Date(date).toISOString(),
      notes: notes || undefined,
    });

    setIsEditing(false);

    if (Platform.OS === 'web') {
      window.alert('Transaction updated!');
    } else {
      Alert.alert('Success', 'Transaction updated!');
    }
  };

  const handleDelete = () => {
    const performDelete = () => {
      if (id) {
        deleteTransaction(id);
        router.back();
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = [...expenseCategories, ...incomeCategories].find((c) => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = [...expenseCategories, ...incomeCategories].find((c) => c.id === categoryId);
    return cat?.color || theme.colors.textSecondary;
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown';
  };

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Transaction</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Transaction not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? 'Edit Transaction' : 'Transaction Details'}
        </Text>
        {isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={[styles.editText, { color: theme.colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (
          // Edit Mode
          <>
            {/* Transaction Type Toggle */}
            <View style={styles.typeContainer}>
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    type === t && {
                      backgroundColor: t === 'expense' ? theme.colors.expense : theme.colors.income,
                    },
                    type !== t && { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                  onPress={() => {
                    setType(t);
                    setSelectedCategory('');
                  }}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === t ? '#ffffff' : theme.colors.textSecondary },
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: type === 'expense' ? theme.colors.expense : theme.colors.income },
                  ]}
                >
                  $
                </Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    { color: type === 'expense' ? theme.colors.expense : theme.colors.income },
                  ]}
                  value={amount > 0 ? amount.toString() : ''}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    setAmount(parseFloat(cleaned) || 0);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>
            </View>

            {/* Description */}
            <Input
              label="Description"
              placeholder="What was this for?"
              value={description}
              onChangeText={setDescription}
            />

            {/* Category Selection */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Category</Text>
              <TouchableOpacity
                style={[styles.selector, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setShowCategories(!showCategories)}
              >
                {selectedCategory && (
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(selectedCategory) }]} />
                )}
                <Text
                  style={[
                    styles.selectorText,
                    { color: selectedCategory ? theme.colors.text : theme.colors.placeholder },
                  ]}
                >
                  {selectedCategory ? getCategoryName(selectedCategory) : 'Select a category'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {showCategories ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showCategories && (
                <View style={[styles.categoryGrid, { backgroundColor: theme.colors.card }]}>
                  {categories.slice(0, 12).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === cat.id && {
                          backgroundColor: cat.color + '30',
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setShowCategories(false);
                      }}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                        <View style={[styles.categoryDotLarge, { backgroundColor: cat.color }]} />
                      </View>
                      <Text
                        style={[styles.categoryName, { color: theme.colors.text }]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date */}
            <Input
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />

            {/* Notes */}
            <Input
              label="Notes (optional)"
              placeholder="Add any additional details..."
              value={notes}
              onChangeText={setNotes}
              multiline
              inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            {/* Save Button */}
            <Button
              title="Save Changes"
              onPress={handleSave}
              fullWidth
              disabled={!amount || !selectedCategory || !description}
              style={{ marginTop: 16 }}
            />
          </>
        ) : (
          // View Mode
          <>
            {/* Amount Display */}
            <View style={styles.amountDisplay}>
              <Text
                style={[
                  styles.amountValue,
                  { color: type === 'expense' ? theme.colors.expense : theme.colors.income },
                ]}
              >
                {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: type === 'expense' ? theme.colors.expense + '20' : theme.colors.income + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    { color: type === 'expense' ? theme.colors.expense : theme.colors.income },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </View>
            </View>

            {/* Details Card */}
            <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{description}</Text>
              </View>

              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Category</Text>
                <View style={styles.categoryDisplay}>
                  <View style={[styles.categoryDotSmall, { backgroundColor: getCategoryColor(selectedCategory) }]} />
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {getCategoryName(selectedCategory)}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Account</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {getAccountName(selectedAccount)}
                </Text>
              </View>

              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Date</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{date}</Text>
              </View>

              {notes && (
                <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Notes</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>{notes}</Text>
                </View>
              )}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: theme.colors.expense + '15' }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
              <Text style={[styles.deleteButtonText, { color: theme.colors.expense }]}>
                Delete Transaction
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  cancelText: {
    fontSize: typography.fontSize.md,
  },
  editText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
  },
  // View mode styles
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  detailsCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: typography.fontSize.md,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  // Edit mode styles
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  typeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    marginRight: 4,
  },
  amountInput: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    minWidth: 100,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 8,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryDotLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
});

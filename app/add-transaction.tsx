// Add Transaction Modal Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useTransactions } from '../hooks';
import { Button, CurrencyInput, Input } from '../components/common';
import { TransactionType, Category } from '../types';
import { typography, borderRadius } from '../constants/theme';
import { format } from 'date-fns';

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { addTransaction, accounts, expenseCategories, incomeCategories } = useTransactions();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = () => {
    if (!amount || !description || !selectedCategory) {
      return;
    }

    // If no account exists, create a default one
    let accountId = selectedAccount;
    if (!accountId && accounts.length === 0) {
      // In a real app, prompt user to create account
      return;
    }

    addTransaction({
      type,
      amount,
      description,
      categoryId: selectedCategory,
      accountId: accountId || accounts[0]?.id,
      date: new Date(date).toISOString(),
      isRecurring: false,
      notes: notes || undefined,
    });

    router.back();
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.name || 'Select Category';
  };

  const getCategoryColor = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.color || theme.colors.textSecondary;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Add Transaction</Text>
        <TouchableOpacity onPress={handleSave} disabled={!amount || !selectedCategory}>
          <Text
            style={[
              styles.saveText,
              { color: amount && selectedCategory ? theme.colors.primary : theme.colors.disabled },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Account Selection */}
        {accounts.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Account</Text>
            <View style={styles.accountGrid}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    { backgroundColor: theme.colors.surfaceVariant },
                    selectedAccount === account.id && {
                      backgroundColor: theme.colors.primary + '20',
                      borderColor: theme.colors.primary,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setSelectedAccount(account.id)}
                >
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>
                    {account.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
          title={`Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          onPress={handleSave}
          fullWidth
          disabled={!amount || !selectedCategory || !description}
          style={{ marginTop: 16 }}
        />
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
  cancelText: {
    fontSize: typography.fontSize.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  saveText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
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
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  accountName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

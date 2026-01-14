// Transactions list screen

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useTransactions } from '../../hooks';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, groupBy, sortByDate } from '../../utils';
import { typography, borderRadius } from '../../constants/theme';
import { format, parseISO } from 'date-fns';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { transactions, categories } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(query)
      );
    }

    return sortByDate(filtered);
  }, [transactions, filterType, searchQuery, categories]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = groupBy(filteredTransactions, (t) => t.date.split('T')[0]);
    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        data: items,
        total: items.reduce((sum, t) => {
          if (t.type === 'income') return sum + t.amount;
          if (t.type === 'expense') return sum - t.amount;
          return sum;
        }, 0),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return {
      name: category?.name || 'Unknown',
      color: category?.color || theme.colors.textSecondary,
    };
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategoryInfo(item.categoryId);

    return (
      <TouchableOpacity
        style={[styles.transactionItem, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          // Navigate to transaction detail/edit
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
        <View style={styles.transactionContent}>
          <View style={styles.transactionMain}>
            <Text style={[styles.transactionDesc, { color: theme.colors.text }]} numberOfLines={1}>
              {item.description}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? theme.colors.income : theme.colors.expense },
              ]}
            >
              {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
          </View>
          <Text style={[styles.transactionCategory, { color: theme.colors.textSecondary }]}>
            {category.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateHeader = (date: string, total: number) => (
    <View style={styles.dateHeader}>
      <Text style={[styles.dateText, { color: theme.colors.text }]}>
        {formatDate(date, 'EEEE, MMMM d')}
      </Text>
      <Text
        style={[
          styles.dateTotalText,
          { color: total >= 0 ? theme.colors.income : theme.colors.expense },
        ]}
      >
        {total >= 0 ? '+' : ''}{formatCurrency(total)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/add-transaction')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.text,
            },
          ]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              filterType === type && { backgroundColor: theme.colors.primary },
              filterType !== type && { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filterType === type ? '#ffffff' : theme.colors.textSecondary },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      {groupedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No transactions found
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            {searchQuery ? 'Try a different search term' : 'Add your first transaction to get started'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/add-transaction')}
            >
              <Text style={styles.emptyButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              {renderDateHeader(group.date, group.total)}
              {group.data.map((transaction) => (
                <View key={transaction.id}>{renderTransaction({ item: transaction })}</View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    fontSize: typography.fontSize.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  dateTotalText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDesc: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    marginRight: 12,
  },
  transactionAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  transactionCategory: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

/**
 * LES Line Item Component
 * Displays a single LES line item with "Why is this here?" explainer
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants/theme';
import {
  EntitlementType,
  DeductionType,
  AllotmentType,
  LESEntitlement,
  LESDeduction,
  LESAllotment,
} from '../../types/les';
import {
  LineItemDescription,
  getLineItemDescription,
} from '../../constants/lesDescriptions';
import { formatCurrency } from '../../utils';

// ============================================================================
// TYPES
// ============================================================================

type LineItemData = LESEntitlement | LESDeduction | LESAllotment;
type LineItemCategory = 'entitlement' | 'deduction' | 'allotment';

interface LESLineItemProps {
  item: LineItemData;
  category: LineItemCategory;
  showYTD?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  highlight?: 'positive' | 'negative' | 'warning' | null;
  changeAmount?: number; // For comparison view
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getItemType(item: LineItemData): string {
  return item.type;
}

function getItemYTD(item: LineItemData): number | undefined {
  if ('ytdAmount' in item) {
    return item.ytdAmount;
  }
  return undefined;
}

function getCategoryIcon(category: LineItemCategory): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'entitlement':
      return 'add-circle';
    case 'deduction':
      return 'remove-circle';
    case 'allotment':
      return 'arrow-forward-circle';
    default:
      return 'ellipse';
  }
}

function getCategoryColor(category: LineItemCategory, colors: any): string {
  switch (category) {
    case 'entitlement':
      return colors.income;
    case 'deduction':
      return colors.expense;
    case 'allotment':
      return colors.warning;
    default:
      return colors.text;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LESLineItem({
  item,
  category,
  showYTD = false,
  onPress,
  onEdit,
  onDelete,
  highlight,
  changeAmount,
}: LESLineItemProps) {
  const theme = useTheme();
  const [showExplainer, setShowExplainer] = useState(false);

  const itemType = getItemType(item);
  const description = getLineItemDescription(
    itemType as EntitlementType | DeductionType | AllotmentType,
    category
  );
  const ytdAmount = getItemYTD(item);
  const categoryColor = getCategoryColor(category, theme.colors);
  const categoryIcon = getCategoryIcon(category);

  // Determine highlight color
  const getHighlightColor = () => {
    if (!highlight) return null;
    switch (highlight) {
      case 'positive':
        return theme.colors.income;
      case 'negative':
        return theme.colors.expense;
      case 'warning':
        return theme.colors.warning;
      default:
        return null;
    }
  };

  const highlightColor = getHighlightColor();

  const handleInfoPress = () => {
    setShowExplainer(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderLeftColor: highlightColor || categoryColor,
            borderLeftWidth: highlightColor ? 4 : 3,
          },
        ]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.mainRow}>
          {/* Icon and Description */}
          <View style={styles.leftSection}>
            <Ionicons
              name={categoryIcon}
              size={20}
              color={categoryColor}
              style={styles.icon}
            />
            <View style={styles.textSection}>
              <Text
                style={[styles.description, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.description || description?.name || itemType}
              </Text>
              {description?.abbreviation && (
                <Text
                  style={[styles.abbreviation, { color: theme.colors.textSecondary }]}
                >
                  {description.abbreviation}
                </Text>
              )}
            </View>
          </View>

          {/* Amount and Actions */}
          <View style={styles.rightSection}>
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  {
                    color: category === 'entitlement'
                      ? theme.colors.income
                      : category === 'deduction'
                      ? theme.colors.expense
                      : theme.colors.text,
                  },
                ]}
              >
                {category === 'entitlement' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </Text>

              {/* Change indicator */}
              {changeAmount !== undefined && changeAmount !== 0 && (
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor:
                        changeAmount > 0
                          ? `${theme.colors.income}20`
                          : `${theme.colors.expense}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={changeAmount > 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={changeAmount > 0 ? theme.colors.income : theme.colors.expense}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      {
                        color:
                          changeAmount > 0 ? theme.colors.income : theme.colors.expense,
                      },
                    ]}
                  >
                    {formatCurrency(Math.abs(changeAmount))}
                  </Text>
                </View>
              )}
            </View>

            {/* Info Button */}
            <TouchableOpacity
              style={[styles.infoButton, { backgroundColor: theme.colors.background }]}
              onPress={handleInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* YTD Row */}
        {showYTD && ytdAmount !== undefined && (
          <View style={styles.ytdRow}>
            <Text style={[styles.ytdLabel, { color: theme.colors.textSecondary }]}>
              YTD:
            </Text>
            <Text style={[styles.ytdAmount, { color: theme.colors.textSecondary }]}>
              {formatCurrency(ytdAmount)}
            </Text>
          </View>
        )}

        {/* Tax-Free Indicator */}
        {'isTaxable' in item && !item.isTaxable && (
          <View style={styles.taxFreeRow}>
            <View
              style={[
                styles.taxFreeBadge,
                { backgroundColor: `${theme.colors.income}15` },
              ]}
            >
              <Ionicons name="shield-checkmark" size={12} color={theme.colors.income} />
              <Text style={[styles.taxFreeText, { color: theme.colors.income }]}>
                TAX FREE
              </Text>
            </View>
          </View>
        )}

        {/* Note */}
        {item.note && (
          <View style={styles.noteRow}>
            <Ionicons
              name="chatbubble-outline"
              size={12}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.noteText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.note}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Explainer Modal */}
      <ExplainerModal
        visible={showExplainer}
        onClose={() => setShowExplainer(false)}
        description={description}
        itemType={itemType}
        category={category}
        theme={theme}
      />
    </>
  );
}

// ============================================================================
// EXPLAINER MODAL
// ============================================================================

interface ExplainerModalProps {
  visible: boolean;
  onClose: () => void;
  description?: LineItemDescription;
  itemType: string;
  category: LineItemCategory;
  theme: any;
}

function ExplainerModal({
  visible,
  onClose,
  description,
  itemType,
  category,
  theme,
}: ExplainerModalProps) {
  if (!description) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {itemType}
            </Text>
            <Text style={[styles.modalBody, { color: theme.colors.textSecondary }]}>
              No description available for this item type.
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {description.name}
                </Text>
                {description.abbreviation && (
                  <Text
                    style={[
                      styles.modalAbbreviation,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    ({description.abbreviation})
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* What Is It */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                What is this?
              </Text>
              <Text style={[styles.sectionBody, { color: theme.colors.text }]}>
                {description.description}
              </Text>
            </View>

            {/* Why You Have It */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Why is this on my LES?
              </Text>
              <Text style={[styles.sectionBody, { color: theme.colors.text }]}>
                {description.whyYouHaveIt}
              </Text>
            </View>

            {/* Eligibility */}
            {description.eligibility && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Who qualifies?
                </Text>
                <Text style={[styles.sectionBody, { color: theme.colors.text }]}>
                  {description.eligibility}
                </Text>
              </View>
            )}

            {/* Amount Info */}
            {description.amount && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  How much?
                </Text>
                <Text style={[styles.sectionBody, { color: theme.colors.text }]}>
                  {description.amount}
                </Text>
              </View>
            )}

            {/* Tax Information */}
            <View
              style={[
                styles.taxInfoBox,
                {
                  backgroundColor:
                    description.taxInfo.includes('TAX FREE')
                      ? `${theme.colors.income}15`
                      : `${theme.colors.warning}15`,
                },
              ]}
            >
              <Ionicons
                name={
                  description.taxInfo.includes('TAX FREE')
                    ? 'shield-checkmark'
                    : 'cash-outline'
                }
                size={18}
                color={
                  description.taxInfo.includes('TAX FREE')
                    ? theme.colors.income
                    : theme.colors.warning
                }
              />
              <Text
                style={[
                  styles.taxInfoText,
                  {
                    color: description.taxInfo.includes('TAX FREE')
                      ? theme.colors.income
                      : theme.colors.text,
                  },
                ]}
              >
                {description.taxInfo}
              </Text>
            </View>

            {/* Common Issues */}
            {description.commonIssues && description.commonIssues.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Common Questions
                </Text>
                {description.commonIssues.map((issue, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>
                      •
                    </Text>
                    <Text style={[styles.bulletText, { color: theme.colors.text }]}>
                      {issue}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* References */}
            {description.references && description.references.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[styles.referencesTitle, { color: theme.colors.textSecondary }]}
                >
                  References
                </Text>
                <Text
                  style={[styles.referencesText, { color: theme.colors.textSecondary }]}
                >
                  {description.references.join(' | ')}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  textSection: {
    flex: 1,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  abbreviation: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 2,
    gap: 2,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  infoButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ytdRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  ytdLabel: {
    fontSize: typography.fontSize.xs,
  },
  ytdAmount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  taxFreeRow: {
    marginTop: spacing.xs,
  },
  taxFreeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  taxFreeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  noteText: {
    fontSize: typography.fontSize.xs,
    flex: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitleRow: {
    flex: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  modalAbbreviation: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  modalCloseIcon: {
    padding: spacing.xs,
  },
  modalBody: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  taxInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  taxInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bullet: {
    width: 16,
    fontSize: typography.fontSize.md,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  referencesTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  referencesText: {
    fontSize: typography.fontSize.xs,
  },
  closeButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

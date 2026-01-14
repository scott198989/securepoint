// Modal component for dialogs and bottom sheets

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { borderRadius, typography } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
}: ModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={!fullScreen}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {!fullScreen && (
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        <View
          style={[
            fullScreen ? styles.fullScreenContent : styles.content,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom || 20,
            },
            fullScreen && { paddingTop: insets.top },
          ]}
        >
          {(title || showCloseButton) && (
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              {title && (
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

// Confirmation dialog variant
interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.dialogOverlay]}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.dialogTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.dialogMessage, { color: theme.colors.textSecondary }]}>
                {message}
              </Text>
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.dialogButton, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.dialogButtonText, { color: theme.colors.text }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                  style={[
                    styles.dialogButton,
                    styles.dialogConfirmButton,
                    {
                      backgroundColor: destructive
                        ? '#f44336'
                        : theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.dialogButtonText, { color: '#ffffff' }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    maxHeight: '90%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  fullScreenContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: typography.fontSize.md,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
  },
  // Dialog styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  dialogTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dialogConfirmButton: {
    borderWidth: 0,
  },
  dialogButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

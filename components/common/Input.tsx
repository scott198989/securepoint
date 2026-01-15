// Input component with validation support

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import { borderRadius, typography } from '../../constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return '#f44336';
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingLeft: leftIcon ? 0 : 16,
              paddingRight: rightIcon ? 0 : 16,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// Currency input variant
interface CurrencyInputProps extends Omit<InputProps, 'keyboardType' | 'value' | 'onChangeText'> {
  value: number;
  onChangeValue: (value: number) => void;
}

export function CurrencyInput({
  value,
  onChangeValue,
  ...props
}: CurrencyInputProps) {
  const theme = useTheme();

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned) || 0;
    onChangeValue(parsed);
  };

  return (
    <Input
      {...props}
      keyboardType="decimal-pad"
      value={value > 0 ? value.toString() : ''}
      onChangeText={handleChange}
      leftIcon={
        <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
          $
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: 12,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  error: {
    color: '#f44336',
    fontSize: typography.fontSize.sm,
    marginTop: 4,
  },
  currencySymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
});

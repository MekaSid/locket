import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from './AppText';

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="caption">{label}</AppText>
      <TextInput
        {...props}
        placeholderTextColor="#8a8a8a"
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    color: '#000000',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
});

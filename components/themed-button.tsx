import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { ThemedText } from './themed-text';

interface ThemedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: any;
}

export function ThemedButton({ children, style, ...props }: ThemedButtonProps) {
  const backgroundColor = useThemeColor({}, 'buttonBackground');
  const color = useThemeColor({}, 'buttonText');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <ThemedText style={[styles.buttonText, { color }]}>{children}</ThemedText>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
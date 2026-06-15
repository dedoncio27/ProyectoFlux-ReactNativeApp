import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { ComponentProps } from 'react';

export type ThemedTextProps = ComponentProps<typeof Text> & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeToVariant: Record<NonNullable<ThemedTextProps['type']>, ComponentProps<typeof Text>['variant']> = {
  default: 'bodyLarge',
  title: 'headlineSmall',
  defaultSemiBold: 'titleMedium',
  subtitle: 'titleLarge',
  link: 'bodyLarge',
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const variant = typeToVariant[type];
  const colorFromScheme =
    type === 'link'
      ? theme.colors.primary
      : theme.dark
        ? (darkColor ?? theme.colors.onSurface)
        : (lightColor ?? theme.colors.onSurface);

  return (
    <Text
      variant={variant}
      style={[
        { color: colorFromScheme },
        type === 'defaultSemiBold' && styles.semiBold,
        type === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  semiBold: {
    fontWeight: '600',
  },
  link: {
    textDecorationLine: 'underline',
  },
});

import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Surface, useTheme } from 'react-native-paper';

interface CustomRowButtonProps {
  title: string;
  description?: string;
  icon: string;
  onPress: () => void;
}

export default function CustomRowButton({ title, description, icon, onPress }: CustomRowButtonProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.surface} elevation={1}>
      <List.Item
        title={title}
        description={description}
        titleStyle={[styles.title, { color: theme.colors.onSurface }]}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        // SOLUClÓN: Pasamos las propiedades directamente en lugar de crear funciones flecha anónimas inline
        left={props => <List.Icon {...props} icon={icon} color={theme.colors.primary} />}
        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
        onPress={onPress}
        style={styles.listItem}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,     // Un margen más sutil para que respire
    overflow: 'hidden',    // Mantiene el efecto Ripple dentro de las esquinas redondeadas
  },
  listItem: {
    paddingVertical: 4,    // Un padding más compacto para mejorar la tasa de refresco al renderizar
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
});
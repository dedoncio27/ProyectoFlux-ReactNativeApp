import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Appbar,
  Searchbar,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type FoodTabRoute = '/misAlimentos' | '/bibliotecaGlobal' | '/misRecetas';

type FoodTopbarProps = {
  title: string;
  placeholder: string;
  activeTab: FoodTabRoute;
  query?: string;
  onQueryChange?: (text: string) => void;
  right?: React.ReactNode;
};

const tabs: { label: string; value: FoodTabRoute }[] = [
  { label: 'Mis alimentos', value: '/misAlimentos' },
  { label: 'Biblioteca', value: '/bibliotecaGlobal' },
  { label: 'Mis recetas', value: '/misRecetas' },
];

/**
 * FoodTopbar es el encabezado común que se usa en la parte superior de 
 * misAlimentos.tsx, misRecetas.tsx y bibliotecaGlobal.tsx.
 * Se encarga del buscador y de navegar (router.replace) entre las 3 pantallas.
 */
export function FoodTopbar({
  title,
  placeholder,
  activeTab,
  query: controlledQuery,
  onQueryChange,
  right,
}: FoodTopbarProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [localQuery, setLocalQuery] = useState('');

  const query = controlledQuery !== undefined ? controlledQuery : localQuery;
  const setQuery = onQueryChange || setLocalQuery;

  const handleTabChange = (value: string) => {
    const route = value as FoodTabRoute;
    if (route !== activeTab) {
      router.replace(route as never);
    }
  };

  return (
    <View style={[styles.headerBlock, { backgroundColor: theme.colors.primary, paddingTop: insets.top, paddingBottom: 0 }]}>
      <Appbar.Header
        mode="center-aligned"
        statusBarHeight={0}
        style={{
          height: 170,
          backgroundColor: theme.colors.primary,
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          paddingBottom: 12,
        }}
      >
        {/* Row 1: Back Action & Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 48 }}>
          <Appbar.BackAction onPress={() => router.back()} iconColor={theme.colors.onPrimary} />
          <Appbar.Content title={title} titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18, alignSelf: 'center' }} />
          {right && (
            <View style={styles.rightContainer}>
              {right}
            </View>
          )}
          <View style={{ width: 48 }} />
        </View>

        {/* Row 2: Searchbar */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12, marginTop: 12 }}>
          <Searchbar
            placeholder={placeholder}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchbar, { backgroundColor: theme.colors.secondary }]}
            inputStyle={{ color: theme.colors.onSecondaryContainer }}
            iconColor={theme.colors.onSecondaryContainer}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            elevation={0}
          />
        </View>

        {/* Row 3: SegmentedButtons */}
        <View style={{ paddingHorizontal: 12 }}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={handleTabChange}
            density="small"
            buttons={tabs.map((t) => ({
              value: t.value,
              label: t.label,
              checkedColor: theme.colors.primary,
              uncheckedColor: theme.colors.onPrimary,
              style: {
                backgroundColor: activeTab === t.value ? theme.colors.onPrimary : 'transparent',
                borderColor: theme.colors.onPrimary,
              },
              labelStyle: {
                fontSize: 13,
                fontWeight: '600',
              }
            }))}
            style={styles.segmented}
          />
        </View>
      </Appbar.Header>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingBottom: 12,
    zIndex: 10,
  },
  searchbar: {
    borderRadius: 14,
  },
  segmented: {},
  rightContainer: {
    width: 48,
    height: 48,
    marginRight: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'misAlimentos' | 'biblioteca' | 'misRecetas';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'misAlimentos', label: 'Mis alimentos' },
  { key: 'biblioteca', label: 'Biblioteca' },
  { key: 'misRecetas', label: 'Mis recetas' },
];

const tabContent: Record<
  TabKey,
  {
    title: string;
    placeholder: string;
    emptyText: string;
    showAddButton: boolean;
    addButtonText?: string;
  }
> = {
  misAlimentos: {
    title: 'Alimentos',
    placeholder: 'Buscar en mis alimentos...',
    emptyText: 'Aun no hay alimentos',
    showAddButton: true,
    addButtonText: 'Añadir nuevo alimento',
  },
  biblioteca: {
    title: 'Biblioteca Global',
    placeholder: 'Buscar alimento...',
    emptyText: 'Busca tus alimentos',
    showAddButton: false,
  },
  misRecetas: {
    title: 'Recetas',
    placeholder: 'Buscar en mis recetas...',
    emptyText: 'Aun no hay ninguna receta',
    showAddButton: true,
    addButtonText: 'Añadir nueva receta',
  },
};

export default function MisAlimentosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('misAlimentos');
  const activeConfig = tabContent[activeTab];

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.topBarTitle}>{activeConfig.title}</Text>
      </View>

      <View style={styles.blueContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#0f284d" />
          <TextInput
            placeholder={activeConfig.placeholder}
            placeholderTextColor="#446185"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable key={tab.key} style={styles.tabButton} onPress={() => setActiveTab(tab.key)}>
              <Text style={styles.tabText}>{tab.label}</Text>
              <View style={[styles.tabIndicator, activeTab === tab.key && styles.tabIndicatorActive]} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {activeConfig.showAddButton && (
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>{activeConfig.addButtonText}</Text>
          </Pressable>
        )}
        <Text style={styles.emptyText}>{activeConfig.emptyText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  topBar: {
    backgroundColor: '#1565c0',
    height: 110,
    paddingTop: 42,
    paddingBottom: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 18,
    top: 42,
    bottom: 16,
    justifyContent: 'center',
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  blueContainer: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  searchBar: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#4a90dd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#0f284d',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabButton: {
    width: '32%',
    alignItems: 'center',
  },
  tabText: {
    color: '#e6f0fb',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  tabIndicator: {
    width: '100%',
    height: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: '#cfe3fb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  addButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4a90dd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 24,
    color: '#8a8a8a',
    fontSize: 24,
    textAlign: 'center',
  },
});

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

type FoodTabRoute = '/misAlimentos' | '/bibliotecaGlobal' | '/misRecetas';

type FoodBrowserLayoutProps = {
  title: string;
  placeholder: string;
  activeTab: FoodTabRoute;
  emptyText: string;
  showAddButton?: boolean;
  addButtonText?: string;
};

const tabs: { label: string; route: FoodTabRoute }[] = [
  { label: 'Mis alimentos', route: '/misAlimentos' },
  { label: 'Biblioteca', route: '/bibliotecaGlobal' },
  { label: 'Mis recetas', route: '/misRecetas' },
];

export function FoodBrowserLayout({
  title,
  placeholder,
  activeTab,
  emptyText,
  showAddButton = false,
  addButtonText = '',
}: FoodBrowserLayoutProps) {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>

      <View style={styles.blueContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>Q</Text>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#446185"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.route}
              style={styles.tabButton}
              onPress={() => router.replace(tab.route as never)}>
              <Text style={styles.tabText}>{tab.label}</Text>
              <View style={[styles.tabIndicator, activeTab === tab.route && styles.tabIndicatorActive]} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {showAddButton && (
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>{addButtonText}</Text>
          </Pressable>
        )}
        <Text style={styles.emptyText}>{emptyText}</Text>
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
    paddingTop: 54,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 14,
    bottom: 10,
  },
  backIcon: {
    color: '#fff',
    fontSize: 28,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  blueContainer: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  searchBar: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#4a90dd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
  },
  searchIcon: {
    color: '#0f284d',
    fontSize: 24,
    fontWeight: '700',
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

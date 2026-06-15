import { auth, db } from '@/config/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Surface, Text, useTheme } from 'react-native-paper';

import { AlimentoItem } from '@/components/alimento-item';
import { FoodTopbar } from '@/components/food-browser-layout';
import { Receta } from '@/types/receta';

export default function MisRecetasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const localParams = useLocalSearchParams<{ fecha?: string; comida?: string }>();
  const fecha = localParams.fecha || new Date().toISOString().split('T')[0];
  const comida = localParams.comida || 'Desayuno';

  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user ? user.email : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'Recetas'),
      where('email', '==', userEmail)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => new Receta(doc.id, doc.data()));
        setItems(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const cleanQuery = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.nombreReceta.toLowerCase().includes(cleanQuery)
    );
  }, [items, searchQuery]);

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FoodTopbar
        activeTab="/misRecetas"
        title="Recetas"
        placeholder="Buscar en mis recetas..."
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      <View style={{ flex: 1 }}>
        <Button
          mode="contained"
          onPress={() => { router.push('/nuevaReceta'); }}
          style={{ marginTop: 12, marginBottom: 10, marginHorizontal: 12, borderRadius: 22 }}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        >
          Añadir nueva receta
        </Button>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : filteredItems.length === 0 ? (
          <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Aun no hay ninguna receta
          </Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlimentoItem
                alimento={item.toListItem()}
                onPress={() => {
                  router.push({
                    pathname: '/addDelOrEdItem',
                    params: {
                      id: item.id,
                      email: item.email,
                      nombreAlimento: item.nombreReceta,
                      marca: 'Receta Casera',
                      medida: item.medidaReceta,
                      cantidad: item.cantidadTotalReceta,
                      calorias: item.caloriasReceta,
                      carbohidratos: item.carbohidratosReceta,
                      proteinas: item.proteinasReceta,
                      grasas: item.grasasReceta,
                      descripcion: item.descripcion || '',
                      type: 'receta',
                      alimentosReceta: JSON.stringify(item.alimentosReceta),
                      cantidadesReceta: JSON.stringify(item.cantidadesReceta),
                      fecha: fecha,
                      comida: comida,
                    }
                  });
                }}
              />
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  addButton: {
    marginBottom: 12,
    borderRadius: 22,
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
  },
});

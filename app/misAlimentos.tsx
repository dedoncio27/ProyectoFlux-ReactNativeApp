import { auth, db } from '@/config/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { AlimentoItem } from '@/components/alimento-item';
import { FoodTopbar, type FoodTabRoute } from '@/components/food-browser-layout';
import { Alimento } from '@/types/alimento';
import { Receta } from '@/types/receta';

const tabConfig: Record<
  FoodTabRoute,
  {
    title: string;
    placeholder: string;
    emptyText: string;
    showAddButton: boolean;
    addButtonText?: string;
  }
> = {
  '/misAlimentos': {
    title: 'Alimentos',
    placeholder: 'Buscar en mis alimentos...',
    emptyText: 'Aun no hay alimentos',
    showAddButton: true,
    addButtonText: 'Añadir nuevo alimento',
  },
  '/bibliotecaGlobal': {
    title: 'Biblioteca Global',
    placeholder: 'Buscar alimento...',
    emptyText: 'Busca tus alimentos',
    showAddButton: false,
  },
  '/misRecetas': {
    title: 'Recetas',
    placeholder: 'Buscar en mis recetas...',
    emptyText: 'Aun no hay ninguna receta',
    showAddButton: true,
    addButtonText: 'Añadir nueva receta',
  },
};

export default function MisAlimentosScreen() {
  const theme = useTheme();
  const router = useRouter();
  const localParams = useLocalSearchParams<{ fecha?: string; comida?: string }>();
  const fecha = localParams.fecha || new Date().toISOString().split('T')[0];
  const comida = localParams.comida || 'Desayuno';

  const [activeTab, setActiveTab] = useState<FoodTabRoute>('/misAlimentos');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Array<Alimento | Receta>>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const cfg = useMemo(() => tabConfig[activeTab], [activeTab]);


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

    // 1. Agrupamos los estados iniciales de carga de forma limpia
    setLoading(true);
    setSearchQuery('');

    let q;
    if (activeTab === '/misAlimentos') {
      q = query(collection(db, 'MisAlimentos'), where('email', '==', userEmail));
    } else if (activeTab === '/misRecetas') {
      q = query(collection(db, 'Recetas'), where('email', '==', userEmail));
    }

    if (!q) {
      setItems([]); // Limpiamos si no coincide ninguna pestaña válida
      setLoading(false);
      return;
    }

    // Variable de control para evitar actualizar estados si el usuario cambia de pestaña rápido
    let isMounted = true;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Si el usuario ya cambió de pestaña mientras llegaban los datos, ignoramos esta respuesta
        if (!isMounted) return;

        const list = snapshot.docs.map((doc) => {
          return activeTab === '/misRecetas'
            ? new Receta(doc.id, doc.data())
            : new Alimento(doc.id, doc.data());
        });

        setItems(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to Firestore collection:', error);
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeTab, userEmail]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const cleanQuery = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (item instanceof Receta) {
        return item.nombreReceta.toLowerCase().includes(cleanQuery);
      }
      return (
        item.nombreAlimento.toLowerCase().includes(cleanQuery) ||
        item.marca.toLowerCase().includes(cleanQuery)
      );
    });
  }, [items, searchQuery]);

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FoodTopbar
        activeTab="/misAlimentos"
        title="Alimentos"
        placeholder="Buscar en mis alimentos..."
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      <View style={{ flex: 1 }}>
        <Button
          mode="contained"
          onPress={() => { router.push({ pathname: '/nuevoAlimento' }) }}
          style={{ marginTop: 12, marginBottom: 10, marginHorizontal: 12, borderRadius: 22 }}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        >
          Añadir nuevo alimento
        </Button>
        {filteredItems.length === 0 ? (
          <Text
            variant="titleMedium"
            style={{
              marginTop: 32,
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {cfg.emptyText}
          </Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlimentoItem
                alimento={item.toListItem()}
                onPress={() => {
                  const isRec = item instanceof Receta;
                  router.push({
                    pathname: '/addDelOrEdItem',
                    params: {
                      id: item.id,
                      email: item.email,
                      nombreAlimento: isRec ? (item as Receta).nombreReceta : (item as Alimento).nombreAlimento,
                      marca: isRec ? 'Receta Casera' : ((item as Alimento).marca || ''),
                      medida: isRec ? (item as Receta).medidaReceta : (item as Alimento).medida,
                      cantidad: isRec ? (item as Receta).cantidadTotalReceta : (item as Alimento).cantidad,
                      calorias: isRec ? (item as Receta).caloriasReceta : (item as Alimento).calorias,
                      carbohidratos: isRec ? (item as Receta).carbohidratosReceta : (item as Alimento).carbohidratos,
                      proteinas: isRec ? (item as Receta).proteinasReceta : (item as Alimento).proteinas,
                      grasas: isRec ? (item as Receta).grasasReceta : (item as Alimento).grasas,
                      descripcion: item.descripcion || '',
                      type: isRec ? 'receta' : 'alimento',
                      alimentosReceta: isRec ? JSON.stringify((item as Receta).alimentosReceta) : '',
                      cantidadesReceta: isRec ? JSON.stringify((item as Receta).cantidadesReceta) : '',
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

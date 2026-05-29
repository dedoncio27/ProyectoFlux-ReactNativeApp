import { AlimentoItem, type AlimentoListItem } from '@/components/alimento-item';
import { FoodTopbar } from '@/components/food-browser-layout';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text, useTheme } from 'react-native-paper';

type OpenFoodProduct = {
  code: string;
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  serving_quantity?: string;
  serving_unit?: string;
  quantity?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    carbohydrates_100g?: number;
    proteins_100g?: number;
    fat_100g?: number;
  };
};

function mapProductToAlimento(product: OpenFoodProduct): AlimentoListItem {
  const nutriments = product.nutriments || {};
  const hasServingData = nutriments['energy-kcal_serving'] != null;

  const cantidad = hasServingData ? (product.serving_quantity ?? '100') : '100';
  const medida = hasServingData ? (product.serving_unit ?? 'g') : 'g';
  const calorias = hasServingData
    ? String(nutriments['energy-kcal_serving'] ?? 0)
    : String(nutriments['energy-kcal_100g'] ?? 0);

  return {
    nombreAlimento: product.product_name_es || product.product_name || 'Sin nombre',
    marca: product.brands?.split(',')[0].trim() || undefined,
    cantidad: String(cantidad),
    medida,
    calorias,
    carbohidratos: String(nutriments.carbohydrates_100g ?? 0),
    proteinas: String(nutriments.proteins_100g ?? 0),
    grasas: String(nutriments.fat_100g ?? 0),
  };
}

export default function BibliotecaGlobalScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AlimentoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scanner states
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const searchOpenFoodFacts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&json=1&page_size=20&fields=code,product_name,product_name_es,brands,quantity,serving_quantity,serving_unit,nutriments`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'TuApp/1.0 (tuemail@ejemplo.com)' },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const products: OpenFoodProduct[] = data.products || [];
      const mapped = products.map(mapProductToAlimento);

      setResults(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    setScannerVisible(false);

    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TuApp/1.0 (tuemail@ejemplo.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        throw new Error('Producto no encontrado en OpenFoodFacts');
      }

      const mapped = mapProductToAlimento(data.product);
      setResults([mapped]);
      setSearchQuery(data.product.product_name_es || data.product.product_name || barcode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el producto');
      setResults([]);
    } finally {
      setLoading(false);
      setScanned(false);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchOpenFoodFacts(searchQuery);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRetry = useCallback(() => {
    if (searchQuery.trim()) {
      searchOpenFoodFacts(searchQuery);
    }
  }, [searchOpenFoodFacts, searchQuery]);

  const openScanner = useCallback(async () => {
    setScanned(false);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError('Se necesita permiso de cámara para escanear códigos');
        return;
      }
    }
    setScannerVisible(true);
  }, [permission, requestPermission]);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    setScanned(false);
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      if (scanned) return;
      setScanned(true);
      setScannerVisible(false);

      setTimeout(() => {
        searchByBarcode(data);
      }, 150);
    },
    [scanned, searchByBarcode]
  );

  const renderItem = useCallback(
    ({ item }: { item: AlimentoListItem }) => (
      <AlimentoItem
        alimento={item}
        onPress={() => {
          router.push({
            pathname: '/addDelOrEdItem',
            params: {
              fromGlobal: 'true',
              id: "",
              email: "",
              nombreAlimento: item.nombreAlimento,
              marca: item.marca || "Marca Global",
              medida: item.medida,
              cantidad: item.cantidad,
              calorias: item.calorias,
              carbohidratos: item.carbohidratos,
              proteinas: item.proteinas,
              grasas: item.grasas,
              descripcion: '',
              type: 'alimento',
              alimentosReceta: '',
              cantidadesReceta: '',
              fecha: '',
              comida: '',
            }
          });
        }}
      />
    ),
    [router]
  );

  const keyExtractor = useCallback(
    (item: AlimentoListItem, index: number) => `${item.nombreAlimento}-${index}`,
    []
  );

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FoodTopbar
        activeTab="/bibliotecaGlobal"
        title="Biblioteca Global"
        placeholder="Buscar alimento..."
        query={searchQuery}
        onQueryChange={setSearchQuery}
        right={
          <IconButton
            icon="barcode-scan"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={openScanner}
          />
        }
      />

      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={theme.colors.primary}
          />
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text
              variant="bodyMedium"
              style={[styles.emptyText, { color: theme.colors.error }]}
            >
              {error}
            </Text>
            <Button
              mode="contained-tonal"
              icon="refresh"
              onPress={handleRetry}
              style={styles.retryButton}
            >
              Reintentar
            </Button>
          </View>
        )}

        {!loading && !error && results.length === 0 && searchQuery.trim() !== '' && (
          <Text
            variant="titleMedium"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No se encontraron alimentos
          </Text>
        )}

        {!loading && !error && searchQuery.trim() === '' && (
          <Text
            variant="titleMedium"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            Busca tus alimentos o escanea un código de barras
          </Text>
        )}

        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={results.length === 0 ? { flex: 1 } : styles.listContent}
        />
      </View>

      {scannerVisible && (
        <View style={[StyleSheet.absoluteFill, styles.scannerOverlay]}>
          <View style={styles.scannerHeader}>
            <Text variant="titleMedium" style={{ color: 'white' }}>
              Escanear código
            </Text>
            <IconButton
              icon="close"
              iconColor="white"
              size={24}
              onPress={closeScanner}
            />
          </View>

          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
              }}
            />
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={{ color: 'white', marginBottom: 16 }}>
                Se requiere permiso de cámara
              </Text>
              <Button mode="contained" onPress={requestPermission}>
                Conceder permiso
              </Button>
            </View>
          )}

          {scanned && (
            <View style={styles.scannedOverlay}>
              <ActivityIndicator color="white" size="large" />
              <Text style={{ color: 'white', marginTop: 12 }}>
                Buscando producto...
              </Text>
            </View>
          )}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
  },
  loader: {
    marginTop: 32,
  },
  errorContainer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  scannerOverlay: {
    zIndex: 100,
    backgroundColor: 'black',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 16,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
});
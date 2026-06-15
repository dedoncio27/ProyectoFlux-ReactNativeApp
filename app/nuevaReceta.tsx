import { db } from '@/config/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Card,
    Divider,
    IconButton,
    Menu,
    Searchbar,
    Snackbar,
    Surface,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tipos para mantener consistencia con el proyecto
interface AlimentoData {
    id: string;
    nombreAlimento: string;
    marca: string;
    medida: string;
    cantidad: number;
    calorias: number;
    carbohidratos: number;
    proteinas: number;
    grasas: number;
    descripcion?: string;
}
interface AlimentoSeleccionado extends AlimentoData {
    cantidadLocal: number;
}

export default function NuevaRecetaScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Params for edit mode
    const params = useLocalSearchParams<{
        editId?: string;
        nombreReceta?: string;
        descripcion?: string;
        medida?: string;
        cantidad?: string;
        calorias?: string;
        carbohidratos?: string;
        proteinas?: string;
        grasas?: string;
        alimentosReceta?: string;
        cantidadesReceta?: string;
    }>();

    const isEditMode = !!params.editId;

    // Estados del formulario
    const [nombreReceta, setNombreReceta] = useState(params.nombreReceta || '');
    const [descripcion, setDescripcion] = useState(params.descripcion || '');


    // Estados de cantidad/unidad
    const [medida, setMedida] = useState(params.medida || 'g');
    const [medidaMenuOpen, setMedidaMenuOpen] = useState(false);

    // Estados de alimentos seleccionados
    const [alimentosSeleccionados, setAlimentosSeleccionados] = useState<AlimentoSeleccionado[]>([]);

    // Estados del modal de selección
    const [modalVisible, setModalVisible] = useState(false);
    const [todosAlimentos, setTodosAlimentos] = useState<AlimentoData[]>([]);
    const [alimentosFiltrados, setAlimentosFiltrados] = useState<AlimentoData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Estados de carga
    const [loading, setLoading] = useState(false);
    const [loadingAlimentos, setLoadingAlimentos] = useState(false);
    const [loadingEditData, setLoadingEditData] = useState(isEditMode);

    // NUEVOS ESTADOS PARA EL TOAST (MENSAGE FLOTANTE)
    const [toastVisible, setToastVisible] = useState(false);
    const [alimentoAñadido, setAlimentoAñadido] = useState('');

    // Cargar alimentos de "MisAlimentos" al abrir el modal
    useEffect(() => {
        if (modalVisible) {
            cargarAlimentos();
        }
    }, [modalVisible]);

    // Cargar datos existentes en modo edición
    useEffect(() => {
        if (!isEditMode) return;

        const cargarDatosEdicion = async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser?.email) {
                setLoadingEditData(false);
                return;
            }

            try {
                // Parse the recipe ingredient IDs and quantities from params
                let alimentosIds: string[] = [];
                let cantidadesMap: Record<string, number> = {};
                try {
                    alimentosIds = params.alimentosReceta ? JSON.parse(params.alimentosReceta) : [];
                } catch { alimentosIds = []; }
                try {
                    const raw = params.cantidadesReceta ? JSON.parse(params.cantidadesReceta) : {};
                    cantidadesMap = raw;
                } catch { cantidadesMap = {}; }

                if (alimentosIds.length === 0) {
                    setLoadingEditData(false);
                    return;
                }

                // Load the user's alimentos from Firebase to find the recipe ingredients
                const q = query(
                    collection(db, 'MisAlimentos'),
                    where('email', '==', currentUser.email)
                );
                const snapshot = await getDocs(q);
                const allAlimentos: AlimentoData[] = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    allAlimentos.push({
                        id: data.id || docSnap.id,
                        nombreAlimento: data.NombreAlimento || data.nombreAlimento || '',
                        marca: data.Marca || data.marca || '',
                        medida: data.Medida || data.medida || 'g',
                        cantidad: parseFloat(data.Cantidad || data.cantidad) || 100,
                        calorias: parseFloat(data.Calorias || data.calorias) || 0,
                        carbohidratos: parseFloat(data.Carbohidratos || data.carbohidratos) || 0,
                        proteinas: parseFloat(data.Proteinas || data.proteinas) || 0,
                        grasas: parseFloat(data.Grasas || data.grasas) || 0,
                        descripcion: data.Descripcion || data.descripcion || '',
                    });
                });

                // Map the recipe ingredients with their quantities
                const seleccionados: AlimentoSeleccionado[] = [];
                for (const ingredientId of alimentosIds) {
                    const found = allAlimentos.find(
                        (a) => a.id === ingredientId || a.nombreAlimento.toLowerCase() === ingredientId.toLowerCase()
                    );
                    if (found) {
                        const cantidadLocal = parseFloat(String(cantidadesMap[ingredientId])) || found.cantidad;
                        seleccionados.push({ ...found, cantidadLocal });
                    }
                }
                setAlimentosSeleccionados(seleccionados);
            } catch (error) {
                console.error('Error cargando datos de edición:', error);
            } finally {
                setLoadingEditData(false);
            }
        };

        cargarDatosEdicion();
    }, []);

    // Filtrar alimentos cuando cambia la búsqueda
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setAlimentosFiltrados(todosAlimentos);
        } else {
            const filtrados = todosAlimentos.filter(
                (alimento) =>
                    alimento.nombreAlimento.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (alimento.marca && alimento.marca.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setAlimentosFiltrados(filtrados);
        }
    }, [searchQuery, todosAlimentos]);

    const cargarAlimentos = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser?.email) return;
        setLoadingAlimentos(true);
        try {
            const q = query(
                collection(db, 'MisAlimentos'),
                where('email', '==', currentUser.email)
            );
            const snapshot = await getDocs(q);
            const alimentos: AlimentoData[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                alimentos.push({
                    id: data.id || docSnap.id,
                    nombreAlimento: data.NombreAlimento || data.nombreAlimento || '',
                    marca: data.Marca || data.marca || '',
                    medida: data.Medida || data.medida || 'g',
                    cantidad: parseFloat(data.Cantidad || data.cantidad) || 100,
                    calorias: parseFloat(data.Calorias || data.calorias) || 0,
                    carbohidratos: parseFloat(data.Carbohidratos || data.carbohidratos) || 0,
                    proteinas: parseFloat(data.Proteinas || data.proteinas) || 0,
                    grasas: parseFloat(data.Grasas || data.grasas) || 0,
                    descripcion: data.Descripcion || data.descripcion || '',
                });
            });
            setTodosAlimentos(alimentos);
            setAlimentosFiltrados(alimentos);
        } catch (error) {
            console.error('Error cargando alimentos:', error);
            Alert.alert('Error', 'No se pudieron cargar los alimentos');
        } finally {
            setLoadingAlimentos(false);
        }
    };

    // Calcular totales automáticamente
    const calcularTotales = () => {
        return alimentosSeleccionados.reduce(
            (acc, alimento) => {
                const proporcion = alimento.cantidadLocal / alimento.cantidad;
                return {
                    calorias: acc.calorias + alimento.calorias * proporcion,
                    carbohidratos: acc.carbohidratos + alimento.carbohidratos * proporcion,
                    proteinas: acc.proteinas + alimento.proteinas * proporcion,
                    grasas: acc.grasas + alimento.grasas * proporcion,
                    pesoTotal: acc.pesoTotal + alimento.cantidadLocal,
                };
            },
            { calorias: 0, carbohidratos: 0, proteinas: 0, grasas: 0, pesoTotal: 0 }
        );
    };
    const totales = calcularTotales();

    const agregarAlimento = (alimento: AlimentoData) => {
        const existente = alimentosSeleccionados.find((a) => a.id === alimento.id);
        if (existente) {
            setAlimentosSeleccionados(
                alimentosSeleccionados.map((a) =>
                    a.id === alimento.id ? { ...a, cantidadLocal: a.cantidadLocal + alimento.cantidad } : a
                )
            );
        } else {
            setAlimentosSeleccionados([
                ...alimentosSeleccionados,
                { ...alimento, cantidadLocal: alimento.cantidad },
            ]);
        }

        // DISPARAR EL MENSAJE FLOTANTE (TOAST)
        setAlimentoAñadido(alimento.nombreAlimento);
        setToastVisible(true);
    };

    const eliminarAlimento = (id: string) => {
        setAlimentosSeleccionados(alimentosSeleccionados.filter((a) => a.id !== id));
    };

    const modificarCantidadAlimento = (id: string, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            eliminarAlimento(id);
        } else {
            setAlimentosSeleccionados(
                alimentosSeleccionados.map((a) => (a.id === id ? { ...a, cantidadLocal: nuevaCantidad } : a))
            );
        }
    };

    const guardarReceta = async () => {
        if (!nombreReceta.trim()) {
            Alert.alert('Error', 'El nombre de la receta es obligatorio');
            return;
        }

        if (alimentosSeleccionados.length === 0) {
            Alert.alert('Error', 'Añade al menos un alimento a la receta');
            return;
        }
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser?.email) {
            Alert.alert('Error', 'No se pudo identificar al usuario');
            return;
        }

        setLoading(true);
        try {
            const alimentosArray = alimentosSeleccionados.map((a) => a.id);
            const cantidadesMap: Record<string, number> = {};

            alimentosSeleccionados.forEach((a) => {
                cantidadesMap[a.id] = a.cantidadLocal;
            });

            if (isEditMode && params.editId) {
                // Update existing recipe
                const docRef = doc(db, 'Recetas', params.editId);
                await updateDoc(docRef, {
                    NombreReceta: nombreReceta.trim(),
                    MedidaReceta: medida,
                    CantidadTotalReceta: parseFloat(totales.pesoTotal.toFixed(1)),
                    CaloriasReceta: parseFloat(totales.calorias.toFixed(1)),
                    CarbohidratosReceta: parseFloat(totales.carbohidratos.toFixed(1)),
                    ProteinasReceta: parseFloat(totales.proteinas.toFixed(1)),
                    GrasasReceta: parseFloat(totales.grasas.toFixed(1)),
                    AlimentosReceta: alimentosArray,
                    CantidadesReceta: cantidadesMap,
                });

                Alert.alert('Éxito', 'Receta actualizada correctamente', [
                    { text: 'OK', onPress: () => router.dismissTo('/misRecetas') },
                ]);
            } else {
                // Create new recipe
                const newDocRef = doc(collection(db, 'Recetas'));
                const generatedId = newDocRef.id;

                const recetaData = {
                    id: generatedId,
                    email: currentUser.email,
                    NombreReceta: nombreReceta.trim(),
                    MedidaReceta: medida,
                    CantidadTotalReceta: parseFloat(totales.pesoTotal.toFixed(1)),
                    CaloriasReceta: parseFloat(totales.calorias.toFixed(1)),
                    CarbohidratosReceta: parseFloat(totales.carbohidratos.toFixed(1)),
                    ProteinasReceta: parseFloat(totales.proteinas.toFixed(1)),
                    GrasasReceta: parseFloat(totales.grasas.toFixed(1)),
                    AlimentosReceta: alimentosArray,
                    CantidadesReceta: cantidadesMap,
                };
                await setDoc(newDocRef, recetaData);

                Alert.alert('Éxito', 'Receta guardada correctamente', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (error) {
            console.error('Error guardando receta:', error);
            Alert.alert('Error', isEditMode ? 'No se pudo actualizar la receta' : 'No se pudo guardar la receta');
        } finally {
            setLoading(false);
        }
    };

    const renderAlimentoItem = ({ item }: { item: AlimentoData }) => (
        <Pressable
            onPress={() => agregarAlimento(item)}
            style={({ pressed }) => [
                styles.alimentoItem,
                { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
            ]}
        >
            <View style={styles.alimentoInfo}>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                    {item.nombreAlimento}
                </Text>
                {item.marca ? (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.marca}
                    </Text>
                ) : null}
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    {item.calorias} kcal · {item.cantidad}{item.medida}
                </Text>
            </View>
            <IconButton icon="plus-circle" iconColor={theme.colors.primary} size={24} />
        </Pressable>
    );

    return (
        <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 64, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title={isEditMode ? "Editar Receta" : "Nueva Receta"}
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                {/* Información de la receta */}
                <View style={{ marginVertical: 16, marginHorizontal: 16 }}>
                    <Text style={{ marginBottom: 16, fontSize: 22, fontWeight: 'bold' }}>
                        Información de la Receta
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                mode="outlined"
                                label="Nombre de la Receta *"
                                value={nombreReceta}
                                onChangeText={setNombreReceta}
                                style={{ marginBottom: 12 }}
                            />
                            <TextInput
                                mode="outlined"
                                label="Descripción"
                                value={descripcion}
                                onChangeText={setDescripcion}
                                multiline
                                numberOfLines={3}
                                style={{ marginBottom: 12 }}
                            />
                        </View>
                        <View style={{ flex: 0.4, alignItems: 'center', justifyContent: 'center' }}>
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: theme.colors.primaryContainer,
                                }}
                            />
                        </View>
                    </View>
                </View>

                <Divider style={{ marginHorizontal: 16, height: 1 }} />

                {/* Selector de cantidad */}
                <View style={{ marginVertical: 16, marginHorizontal: 16 }}>
                    <Text style={{ marginBottom: 16, fontSize: 22, fontWeight: 'bold' }}>
                        Cantidad Total
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                mode="outlined"
                                label="Cantidad"
                                value={totales.pesoTotal > 0 ? totales.pesoTotal.toFixed(1) : ''}
                                keyboardType="numeric"
                                editable={false}
                            />
                        </View>

                        <Menu
                            visible={medidaMenuOpen}
                            onDismiss={() => setMedidaMenuOpen(false)}
                            anchor={
                                <Pressable
                                    onPress={() => setMedidaMenuOpen(true)}
                                    style={({ pressed }) => [
                                        styles.medidaButton,
                                        {
                                            backgroundColor: theme.colors.surfaceVariant,
                                            borderColor: theme.colors.outline,
                                        },
                                    ]}
                                >
                                    <Text variant="bodyLarge">{medida}</Text>
                                    <Text>▼</Text>
                                </Pressable>
                            }
                        >
                            <Menu.Item onPress={() => { setMedida('g'); setMedidaMenuOpen(false); }} title="g" />
                            <Menu.Item onPress={() => { setMedida('ml'); setMedidaMenuOpen(false); }} title="ml" />
                            <Menu.Item onPress={() => { setMedida('kg'); setMedidaMenuOpen(false); }} title="kg" />
                            <Menu.Item onPress={() => { setMedida('oz'); setMedidaMenuOpen(false); }} title="oz" />
                        </Menu>
                    </View>
                </View>

                {/* Botón Añadir Alimento */}
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <Button
                        mode="contained"
                        onPress={() => setModalVisible(true)}
                        icon="plus"
                        style={{ borderRadius: 22 }}
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                    >
                        Añadir Alimento
                    </Button>
                </View>

                {/* Lista de alimentos seleccionados */}
                {alimentosSeleccionados.length > 0 && (
                    <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                        <Text style={{ marginBottom: 12, fontSize: 18, fontWeight: 'bold' }}>
                            Alimentos en la receta ({alimentosSeleccionados.length})
                        </Text>
                        <Card mode="elevated" style={{ borderRadius: 12 }}>
                            <Card.Content>
                                {alimentosSeleccionados.map((alimento) => (
                                    <View key={alimento.id}>
                                        <View style={styles.alimentoSeleccionado}>
                                            <View style={styles.alimentoSeleccionadoInfo}>
                                                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                                                    {alimento.nombreAlimento}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                    {(alimento.calorias * (alimento.cantidadLocal / alimento.cantidad)).toFixed(1)} kcal
                                                </Text>
                                            </View>

                                            <View style={styles.cantidadControl}>
                                                <IconButton
                                                    icon="minus"
                                                    mode="contained-tonal"
                                                    size={16}
                                                    onPress={() => modificarCantidadAlimento(alimento.id, alimento.cantidadLocal - 10)}
                                                />
                                                <Text variant="bodyMedium" style={{ minWidth: 60, textAlign: 'center' }}>
                                                    {alimento.cantidadLocal}{alimento.medida}
                                                </Text>
                                                <IconButton
                                                    icon="plus"
                                                    mode="contained-tonal"
                                                    size={16}
                                                    onPress={() => modificarCantidadAlimento(alimento.id, alimento.cantidadLocal + 10)}
                                                />
                                            </View>
                                            <IconButton
                                                icon="delete"
                                                iconColor={theme.colors.error}
                                                size={20}
                                                onPress={() => eliminarAlimento(alimento.id)}
                                            />
                                        </View>
                                        <Divider style={{ marginVertical: 4 }} />
                                    </View>
                                ))}
                            </Card.Content>
                        </Card>
                    </View>
                )}

                {/* Totales nutricionales */}
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <Text style={{ marginBottom: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                        Información nutricional
                    </Text>
                    <Card mode="elevated" style={{ borderRadius: 12 }}>
                        <Card.Content>
                            <View style={styles.macrosGrid}>

                                <View style={[styles.macroItem, { backgroundColor: '#0f59bf' }]}>
                                    <Text variant="headlineSmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                                        {totales.proteinas.toFixed(1)}g
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: '#FFFFFF' }}>
                                        Proteínas
                                    </Text>
                                </View>
                                <View style={[styles.macroItem, { backgroundColor: '#eaa129' }]}>
                                    <Text variant="headlineSmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                                        {totales.grasas.toFixed(1)}g
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: '#FFFFFF' }}>
                                        Grasas
                                    </Text>
                                </View>

                                <View style={[styles.macroItem, { backgroundColor: '#d85cf6' }]}>
                                    <Text variant="headlineSmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                                        {totales.carbohidratos.toFixed(1)}g
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: '#FFFFFF' }}>
                                        Carbohidratos
                                    </Text>
                                </View>

                                <View style={[styles.macroItem, { backgroundColor: theme.colors.primaryContainer }]}>
                                    <Text variant="headlineSmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                                        {totales.calorias.toFixed(0)}
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: '#FFFFFF' }}>
                                        Calorías
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            {/* Botón guardar fijo abajo */}
            <View
                style={[
                    styles.fixedButton,
                    { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
                ]}
            >
                <Button
                    mode="contained"
                    onPress={guardarReceta}
                    loading={loading}
                    disabled={loading || !nombreReceta.trim() || alimentosSeleccionados.length === 0}
                    style={{ borderRadius: 22 }}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                    contentStyle={{ paddingVertical: 8 }}
                    labelStyle={{ fontSize: 16, fontWeight: '600' }}
                >
                    {isEditMode ? 'Actualizar Receta' : 'Guardar Receta'}
                </Button>
            </View>

            {/* Modal para seleccionar alimentos */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                        <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.primary }}>
                            <Appbar.BackAction onPress={() => setModalVisible(false)} color={theme.colors.onPrimary} />
                            <Appbar.Content
                                title="Seleccionar Alimento"
                                titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600' }}
                            />
                        </Appbar.Header>
                    </View>
                    <View style={{ padding: 16, paddingBottom: 8 }}>
                        <Searchbar
                            placeholder="Buscar alimento..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ borderRadius: 12 }}
                        />
                    </View>

                    {loadingAlimentos ? (
                        <View style={styles.centerContent}>
                            <Text>Cargando alimentos...</Text>
                        </View>
                    ) : alimentosFiltrados.length === 0 ? (
                        <View style={styles.centerContent}>
                            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 8 }}>
                                No hay alimentos disponibles
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                                Primero añade alimentos en "Mis Alimentos"
                            </Text>
                            <Button
                                mode="contained-tonal"
                                onPress={() => {
                                    setModalVisible(false);
                                    router.push('/nuevoAlimento');
                                }}
                                style={{ marginTop: 16 }}
                            >
                                Añadir Alimento
                            </Button>
                        </View>
                    ) : (
                        <FlatList
                            data={alimentosFiltrados}
                            renderItem={renderAlimentoItem}
                            keyExtractor={(item) => item.id}
                            ItemSeparatorComponent={() => <Divider style={{ marginHorizontal: 16 }} />}
                            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                        />
                    )}

                    {/* SNACKBAR INTEGRADO DENTRO DEL MODAL */}
                    <Snackbar
                        visible={toastVisible}
                        onDismiss={() => setToastVisible(false)}
                        duration={2000} // Se desvanece solo tras 2 segundos
                        style={styles.toastStyle}
                        wrapperStyle={{ bottom: insets.bottom + 16 }} // Evita pisar gestos del sistema
                    >
                        <Text style={{ color: theme.colors.inverseOnSurface, fontWeight: '500' }}>
                            Añadido: {alimentoAñadido}
                        </Text>
                    </Snackbar>

                </Surface>
            </Modal>
        </Surface>
    );
}

const styles = StyleSheet.create({
    medidaButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 4,
        borderWidth: 1,
        minWidth: 80,
        height: 56,
    },
    alimentoSeleccionado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    alimentoSeleccionadoInfo: {
        flex: 1,
    },
    cantidadControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macrosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    macroItem: {
        flexGrow: 1,
        flexShrink: 0,
        minWidth: '28%',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    fixedButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    alimentoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    alimentoInfo: {
        flex: 1,
    },
    // Estilo extra opcional por si quieres elevarlo ligeramente o redondearlo más como Material 3
    toastStyle: {
        borderRadius: 25,
        opacity: 0.95,
    }
});
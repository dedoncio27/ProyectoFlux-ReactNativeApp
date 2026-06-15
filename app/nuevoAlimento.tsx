import { db } from '@/config/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Appbar, Button, Divider, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NuevoAlimentoScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Params for edit mode — if editId is present, we are editing an existing alimento
    const params = useLocalSearchParams<{
        editId?: string;
        nombreAlimento?: string;
        marca?: string;
        medida?: string;
        cantidad?: string;
        calorias?: string;
        carbohidratos?: string;
        proteinas?: string;
        grasas?: string;
        descripcion?: string;
    }>();

    const isEditMode = !!params.editId;

    const [nombreAlimento, setNombreAlimento] = useState(params.nombreAlimento || '');
    const [marca, setMarca] = useState(params.marca || '');
    const [medida, setMedida] = useState(params.medida || 'g');
    const [cantidad, setCantidad] = useState(params.cantidad || '100');
    const [calorias, setCalorias] = useState(params.calorias || '');
    const [carbohidratos, setCarbohidratos] = useState(params.carbohidratos || '');
    const [proteinas, setProteinas] = useState(params.proteinas || '');
    const [grasas, setGrasas] = useState(params.grasas || '');
    const [descripcion, setDescripcion] = useState(params.descripcion || '');

    const [medidaMenuOpen, setMedidaMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const addItemtoDB = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
            Alert.alert('Error', 'No se pudo identificar al usuario actual.');
            return;
        }

        setLoading(true);
        try {
            const newDocRef = doc(collection(db, 'MisAlimentos'));
            const generatedId = newDocRef.id;

            const nuevoAlimento = {
                id: generatedId,
                email: currentUser.email,
                NombreAlimento: nombreAlimento,
                Marca: marca,
                Medida: medida,
                Cantidad: cantidad,
                Calorias: calorias,
                Carbohidratos: carbohidratos,
                Proteinas: proteinas,
                Grasas: grasas,
                Descripcion: descripcion
            };

            await setDoc(newDocRef, nuevoAlimento);

            Alert.alert('Éxito', 'Alimento añadido correctamente', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);

        } catch (error) {
            console.error('Error creating document: ', error);
            Alert.alert('Error', 'Hubo un error al añadir el alimento');
        } finally {
            setLoading(false);
        }
    };

    const updateItemInDB = async () => {
        if (!params.editId) return;

        setLoading(true);
        try {
            const docRef = doc(db, 'MisAlimentos', params.editId);
            await updateDoc(docRef, {
                NombreAlimento: nombreAlimento,
                Marca: marca,
                Medida: medida,
                Cantidad: cantidad,
                Calorias: calorias,
                Carbohidratos: carbohidratos,
                Proteinas: proteinas,
                Grasas: grasas,
                Descripcion: descripcion,
            });

            Alert.alert('Éxito', 'Alimento actualizado correctamente', [
                {
                    text: 'OK',
                    onPress: () => router.dismissTo('/misAlimentos')
                }
            ]);

        } catch (error) {
            console.error('Error updating document: ', error);
            Alert.alert('Error', 'Hubo un error al actualizar el alimento');
        } finally {
            setLoading(false);
        }
    };

    const saveItem = () => {
        // 1. Validación de campos vacíos
        if (calorias === "" ||
            proteinas === "" ||
            carbohidratos === "" ||
            grasas === "" ||
            nombreAlimento === "" ||
            medida === "" ||
            cantidad === ""
        ) {
            Alert.alert("Error", "Rellena todos los campos obligatorios.");
            return; // ⚡ CORREGIDO: detenemos la función si hay campos vacíos
        }

        // 2. Intentar parsear a número
        const caloriasFloat = parseFloat(calorias);
        const hidratosFloat = parseFloat(carbohidratos);
        const proteinasFloat = parseFloat(proteinas);
        const grasasFloat = parseFloat(grasas);

        // 3. Validación de números correctos
        if (isNaN(caloriasFloat) || caloriasFloat < 0 ||
            isNaN(hidratosFloat) || hidratosFloat < 0 ||
            isNaN(proteinasFloat) || proteinasFloat < 0 ||
            isNaN(grasasFloat) || grasasFloat < 0
        ) {
            Alert.alert('Número no válido', 'Los macros y calorías deben ser números mayores o iguales a 0.');
            return;
        }

        // 4. Si pasa los controles, ejecutamos la subida o actualización
        if (isEditMode) {
            updateItemInDB();
        } else {
            addItemtoDB(); // ⚡ CORREGIDO: Ahora sí se ejecuta la función
        }
    }

    return (
        <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 64, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title={isEditMode ? "Editar Alimento" : "Nuevo Alimento"}
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ marginHorizontal: 10, marginBottom: 10, fontSize: 28, fontWeight: 'bold' }}>Información del Alimento</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10 }}>
                        <View style={{ flex: 1 }}>
                            <TextInput mode="outlined" label="Nombre del Alimento" value={nombreAlimento} onChangeText={setNombreAlimento} keyboardType="default" style={{ marginBottom: 10 }} />
                            <TextInput mode="outlined" label="Descripción" value={descripcion} onChangeText={setDescripcion} keyboardType="default" style={{ marginBottom: 10 }} />
                            <TextInput mode="outlined" label="Marca" value={marca} onChangeText={setMarca} keyboardType="default" style={{ marginBottom: 10 }} />
                        </View>
                        <View style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryContainer }} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 10, alignItems: 'center', justifyContent: "space-between" }}>
                        <TextInput mode="outlined" label="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" style={{ flex: 1, marginRight: 6 }} />
                        <Menu
                            visible={medidaMenuOpen}
                            onDismiss={() => setMedidaMenuOpen(false)}
                            style={{ width: '50%' }}
                            anchor={
                                <Button mode="outlined" onPress={() => setMedidaMenuOpen(true)}>
                                    {medida === 'g' ? 'g' : medida === 'ml' ? 'ml' : 'Seleccionar'}
                                </Button>
                            }>
                            <Menu.Item onPress={() => { setMedida('g'); setMedidaMenuOpen(false); }} title="g" />
                            <Menu.Item onPress={() => { setMedida('ml'); setMedidaMenuOpen(false); }} title="ml" />
                        </Menu>
                    </View>
                    <Divider style={{ marginVertical: 20, marginHorizontal: 20, height: 1 }} />
                    <View style={{ marginHorizontal: 10 }}>
                        <Text style={{ marginBottom: 20, marginTop: 10, fontSize: 18, fontWeight: 'bold', textAlign: "center", color: useTheme().colors.onSurfaceVariant }}>Información nutricional por cantidad</Text>
                        <TextInput mode="outlined" label="Carbohidratos" value={carbohidratos} onChangeText={setCarbohidratos} keyboardType="numeric" style={{ marginBottom: 10 }} />
                        <TextInput mode="outlined" label="Proteinas" value={proteinas} onChangeText={setProteinas} keyboardType="numeric" style={{ marginBottom: 10 }} />
                        <TextInput mode="outlined" label="Grasas" value={grasas} onChangeText={setGrasas} keyboardType="numeric" style={{ marginBottom: 10 }} />
                        <TextInput mode="outlined" label="Calorias" value={calorias} onChangeText={setCalorias} keyboardType="numeric" style={{ marginBottom: 10 }} />
                    </View>
                </View>
            </ScrollView>
            <View style={{ padding: 10, margin: 30, }}>
                <Button
                    mode='contained'
                    loading={loading}
                    disabled={loading}
                    onPress={() => saveItem()}
                >
                    {isEditMode ? 'Actualizar Alimento' : 'Guardar Alimento'}
                </Button>
            </View>
        </Surface>
    );
}

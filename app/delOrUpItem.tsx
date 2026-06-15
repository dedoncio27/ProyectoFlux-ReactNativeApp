import { auth, db } from '@/config/firebase';
import { Alimento } from '@/types/alimento';
import { removeConsumedFood, updateConsumedFood } from '@/utils/consumedStorage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';


export default function DelOrUpItemScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        id: string;
        email: string;
        nombreAlimento: string;
        marca: string;
        medida: string;
        cantidad: string;
        calorias: string;
        carbohidratos: string;
        proteinas: string;
        grasas: string;
        descripcion: string;
        type: 'alimento' | 'receta';
        alimentosReceta?: string;
        cantidadesReceta?: string;
        fecha?: string;
        comida?: string;
    }>();


    const [dbAlimentos, setDbAlimentos] = useState<Alimento[]>([]);

    useEffect(() => {
        const emailUsuario = auth.currentUser?.email || '';
        const q = query(
            collection(db, 'MisAlimentos'),
            where('email', '==', emailUsuario)
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map((doc) => new Alimento(doc.id, doc.data()));
                setDbAlimentos(list);
            },
            (error) => {
                console.error('Error fetching foods for ingredients lookup:', error);
            }
        );
        return () => unsubscribe();
    }, []);


    const baseCantidad = parseFloat(params.cantidad) || 100;
    const baseCalorias = parseFloat(params.calorias) || 0;
    const baseCarbohidratos = parseFloat(params.carbohidratos) || 0;
    const baseProteinas = parseFloat(params.proteinas) || 0;
    const baseGrasas = parseFloat(params.grasas) || 0;

    const [quantityStr, setQuantityStr] = useState(params.cantidad || '100');
    const [loading, setLoading] = useState(false);


    const quantity = parseFloat(quantityStr) || 0;
    const factor = baseCantidad > 0 ? quantity / baseCantidad : 1;

    const currentCalorias = Math.round(baseCalorias * factor);
    const currentCarbs = parseFloat((baseCarbohidratos * factor).toFixed(1));
    const currentProtein = parseFloat((baseProteinas * factor).toFixed(1));
    const currentFat = parseFloat((baseGrasas * factor).toFixed(1));


    const totalMacros = currentCarbs + currentProtein + currentFat;
    const carbPct = totalMacros > 0 ? currentCarbs / totalMacros : 0.33;
    const proteinPct = totalMacros > 0 ? currentProtein / totalMacros : 0.33;
    const fatPct = totalMacros > 0 ? currentFat / totalMacros : 0.34;

    const circleSize = 130;
    const strokeWidth = 10;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const carbLength = circumference * carbPct;
    const proteinLength = circumference * proteinPct;
    const fatLength = circumference * fatPct;

    const carbOffset = 0;
    const proteinOffset = -carbLength;
    const fatOffset = -(carbLength + proteinLength);


    const alimentosRecetaIds: string[] = useMemo(() => {
        try {
            return params.alimentosReceta ? JSON.parse(params.alimentosReceta) : [];
        } catch {
            return [];
        }
    }, [params.alimentosReceta]);

    const cantidadesRecetaMap: Record<string, string> = useMemo(() => {
        try {
            return params.cantidadesReceta ? JSON.parse(params.cantidadesReceta) : {};
        } catch {
            return {};
        }
    }, [params.cantidadesReceta]);


    const recipeIngredients = useMemo(() => {
        return alimentosRecetaIds
            .map((ingredientKey) => {
                const foundAlimento = dbAlimentos.find(
                    (a) =>
                        a.id === ingredientKey ||
                        a.nombreAlimento.toLowerCase() === ingredientKey.toLowerCase()
                );
                if (foundAlimento) {
                    const ingredientQty = parseFloat(cantidadesRecetaMap[ingredientKey]) || 0;
                    const baseQty = parseFloat(foundAlimento.cantidad) || 100;
                    const ingredientFactor = baseQty > 0 ? ingredientQty / baseQty : 1;

                    const ingBaseCal = Math.round(parseFloat(foundAlimento.calorias) * ingredientFactor);
                    const ingBaseCarb = parseFloat((parseFloat(foundAlimento.carbohidratos) * ingredientFactor).toFixed(1));
                    const ingBaseProt = parseFloat((parseFloat(foundAlimento.proteinas) * ingredientFactor).toFixed(1));
                    const ingBaseFat = parseFloat((parseFloat(foundAlimento.grasas) * ingredientFactor).toFixed(1));

                    return {
                        id: foundAlimento.id,
                        nombreAlimento: foundAlimento.nombreAlimento,
                        cantidad: parseFloat((ingredientQty * factor).toFixed(1)),
                        medida: foundAlimento.medida || 'g',
                        calorias: Math.round(ingBaseCal * factor),
                        carbohidratos: parseFloat((ingBaseCarb * factor).toFixed(1)),
                        proteinas: parseFloat((ingBaseProt * factor).toFixed(1)),
                        grasas: parseFloat((ingBaseFat * factor).toFixed(1)),
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [alimentosRecetaIds, cantidadesRecetaMap, dbAlimentos, factor]);


    const handleDelete = async () => {
        if (!params.id) return;
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar este elemento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await removeConsumedFood(params.id);
                            Alert.alert('Éxito', 'Elemento eliminado correctamente');
                            router.back();
                        } catch (error) {
                            console.error('Error deleting document: ', error);
                            Alert.alert('Error', 'Hubo un error al eliminar el elemento');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = async () => {
        if (!params.id || Array.isArray(params.id)) {
            Alert.alert('Error', 'No se encontró un ID válido para este alimento.');
            return;
        }

        setLoading(true);
        try {
            await updateConsumedFood(params.id, {
                nombreAlimento: params.nombreAlimento,
                marca: params.marca || 'Receta Casera',
                medida: params.medida || 'g',
                cantidad: quantityStr,
                calorias: currentCalorias.toString(),
                carbohidratos: currentCarbs.toString(),
                proteinas: currentProtein.toString(),
                grasas: currentFat.toString(),
            });

            Alert.alert('Éxito', 'Elemento actualizado correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Error updating consumption: ', error);
            Alert.alert('Error', 'Hubo un error al actualizar el elemento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Aquí ocultamos la cabecera nativa de Expo */}
            <Stack.Screen options={{ headerShown: false }} />

            {/* Tu cabecera azul de React Native Paper */}
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 64, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title={params.nombreAlimento}
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                <View style={styles.topInfoRow}>
                    <View style={styles.nameBrandCol}>
                        <Text variant="headlineMedium" style={[styles.foodName, { color: theme.colors.onSurface }]}>
                            {params.nombreAlimento}
                        </Text>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {params.marca || 'Receta Casera'}
                        </Text>
                    </View>
                    <View style={styles.circleContainer}>
                        <View style={{ width: circleSize, height: circleSize, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={StyleSheet.absoluteFill}>
                                <Svg width={circleSize} height={circleSize}>
                                    <G rotation="-90" origin={`${circleSize / 2}, ${circleSize / 2}`}>
                                        <Circle
                                            cx={circleSize / 2}
                                            cy={circleSize / 2}
                                            r={radius}
                                            stroke={theme.colors.surfaceVariant}
                                            strokeWidth={strokeWidth}
                                            fill="transparent"
                                        />
                                        {carbLength > 0 && (
                                            <Circle
                                                cx={circleSize / 2}
                                                cy={circleSize / 2}
                                                r={radius}
                                                stroke="#d85cf6"
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={`${carbLength} ${circumference}`}
                                                strokeDashoffset={carbOffset}
                                                fill="transparent"
                                                strokeLinecap="round"
                                            />
                                        )}
                                        {proteinLength > 0 && (
                                            <Circle
                                                cx={circleSize / 2}
                                                cy={circleSize / 2}
                                                r={radius}
                                                stroke="#0f59bf"
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={`${proteinLength} ${circumference}`}
                                                strokeDashoffset={proteinOffset}
                                                fill="transparent"
                                                strokeLinecap="round"
                                            />
                                        )}
                                        {fatLength > 0 && (
                                            <Circle
                                                cx={circleSize / 2}
                                                cy={circleSize / 2}
                                                r={radius}
                                                stroke="#eaa129"
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={`${fatLength} ${circumference}`}
                                                strokeDashoffset={fatOffset}
                                                fill="transparent"
                                                strokeLinecap="round"
                                            />
                                        )}
                                    </G>
                                </Svg>
                            </View>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                {currentCalorias}
                            </Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textTransform: 'uppercase' }}>
                                Kcal
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.macrosRow}>
                    <View style={styles.macroCol}>
                        <Text variant="headlineSmall" style={[styles.macroVal, { color: '#d85cf6' }]}>
                            {currentCarbs}
                        </Text>
                        <Text variant="labelSmall" style={styles.macroLabel}>
                            Carbohidratos
                        </Text>
                    </View>
                    <View style={styles.macroCol}>
                        <Text variant="headlineSmall" style={[styles.macroVal, { color: '#0f59bf' }]}>
                            {currentProtein}
                        </Text>
                        <Text variant="labelSmall" style={styles.macroLabel}>
                            Proteinas
                        </Text>
                    </View>
                    <View style={styles.macroCol}>
                        <Text variant="headlineSmall" style={[styles.macroVal, { color: '#eaa129' }]}>
                            {currentFat}
                        </Text>
                        <Text variant="labelSmall" style={styles.macroLabel}>
                            Grasas
                        </Text>
                    </View>
                </View>

                <TextInput
                    label={`Cantidad (${params.medida || 'g'})`}
                    mode="outlined"
                    value={quantityStr}
                    onChangeText={setQuantityStr}
                    keyboardType="numeric"
                    style={styles.input}
                    disabled={loading}
                />
                <View style={styles.actionsRow}>

                    <Button
                        mode="contained"
                        onPress={handleEdit}
                        loading={loading}
                        style={[styles.btn, { backgroundColor: theme.colors.primary }]}
                        labelStyle={styles.btnLabel}
                    >
                        Guardar
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleDelete}
                        loading={loading}
                        style={[styles.btn, { backgroundColor: '#ff0000' }]}
                        labelStyle={styles.btnLabel}
                    >
                        Eliminar
                    </Button>
                </View>
                {params.type === 'receta' && (
                    <View style={styles.ingredientsSection}>
                        <Surface style={[styles.sectionHeader, { backgroundColor: theme.colors.primary }]} elevation={1}>
                            <Text style={styles.sectionHeaderTitle}>Alimentos en receta</Text>
                        </Surface>

                        <View style={styles.ingredientsList}>
                            {recipeIngredients.map((item, index) => {
                                if (!item) return null;
                                return (
                                    <View key={item.id || index}>
                                        <View style={styles.ingredientItem}>
                                            <View>
                                                <Text style={[styles.ingredientName, { color: theme.colors.onSurface }]}>{item.nombreAlimento}</Text>
                                                <Text style={styles.ingredientQty}>{item.cantidad} {item.medida}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.ingredientKcal, { color: theme.colors.primary }]}>
                                                    {item.calorias} kcal
                                                </Text>
                                                <Text style={styles.ingredientMacros}>
                                                    <Text style={{ color: '#8e8e93', fontSize: 12 }}>C: </Text>
                                                    <Text style={{ color: '#d85cf6', fontWeight: 'bold', fontSize: 12 }}>{item.carbohidratos} </Text>
                                                    <Text style={{ color: '#8e8e93', fontSize: 12 }}>P: </Text>
                                                    <Text style={{ color: '#0f59bf', fontWeight: 'bold', fontSize: 12 }}>{item.proteinas} </Text>
                                                    <Text style={{ color: '#8e8e93', fontSize: 12 }}>G: </Text>
                                                    <Text style={{ color: '#eaa129', fontWeight: 'bold', fontSize: 12 }}>{item.grasas}</Text>
                                                </Text>
                                            </View>
                                        </View>
                                        {index < recipeIngredients.length - 1 && <View style={styles.divider} />}
                                    </View>
                                );
                            })}
                            {recipeIngredients.length === 0 && (
                                <Text style={styles.noIngredientsText}>No hay información de los alimentos constituyentes</Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </Surface>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    topInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
    },
    nameBrandCol: {
        flex: 1,
        marginRight: 16,
    },
    foodName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 36,
    },
    macroCol: {
        alignItems: 'center',
    },
    macroVal: {
        fontWeight: 'bold',
    },
    macroLabel: {
        color: '#8e8e93',
        marginTop: 4,
    },
    input: {
        marginBottom: 36,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    btn: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 4,
    },
    btnLabel: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ingredientsSection: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 24,
    },
    sectionHeader: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionHeaderTitle: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    ingredientsList: {
        paddingHorizontal: 4,
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    ingredientName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1c1c1e',
    },
    ingredientQty: {
        color: '#8e8e93',
        marginTop: 4,
        fontSize: 13,
    },
    ingredientKcal: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 4,
    },
    ingredientMacros: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5ea',
    },
    noIngredientsText: {
        textAlign: 'center',
        color: '#8e8e93',
        marginTop: 16,
        fontStyle: 'italic',
    },
});
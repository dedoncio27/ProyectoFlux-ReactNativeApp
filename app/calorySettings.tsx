import { CalorySettings, getCalorySettings, getUserProfile } from '@/utils/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Surface, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function CalorySettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);

    const [altura, setAltura] = useState<string>('');
    const [peso, setPeso] = useState<string>('');
    const [edad, setEdad] = useState<string>('');
    const [sexo, setSexo] = useState('');
    const [actividad, setActividad] = useState('');
    const [objetivo, setObjetivo] = useState('');

    const [calorias, setCalorias] = useState("");

    useEffect(() => {
        const loadData = async () => {
            const saved = await getUserProfile();
            if (saved) {
                setAltura(saved.altura); setPeso(saved.peso); setEdad(saved.edad);
                setSexo(saved.sexo); setActividad(saved.actividad); setObjetivo(saved.objetivo);
            }
        };
        loadData();
    }, []);


    const [settings, setSettings] = useState<CalorySettings>({
        auto: true,
        calorias: 2000,
        proteinas: 150,
        carbohidratos: 200,
        grasas: 65,
    });

    // 1. Cargar los datos guardados al entrar a la pantalla
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await getCalorySettings();
                if (savedSettings) {
                    setSettings(savedSettings);
                }
            } catch (error) {
                console.error("Error cargando configuración:", error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const toggleSwitch = () => {
        setSettings(prev => ({
            ...prev,
            auto: !prev.auto

        }));
    };

    const caloryCalculator = (): number => {
        const traductorActividad: Record<string, string> = {
            nada: 'Casi nada', poca: 'Poca actividad', media: 'Moderada', alta: 'Alta actividad', muy_intensa: 'Muy intensa',
        };
        const traductorObjetivo: Record<string, string> = {
            perder_lento: 'Bajar peso lento', perder_rapido: 'Bajar peso rápido', mantener: 'Mantener peso',
            subir_lento: 'Subir peso lento', subir_rapido: 'Subir peso rápido',
        };

        const sedentarismo = 1.2;
        const ejercicioLigero = 1.375;
        const ejercicioModerado = 1.55;
        const ejercicioFuerte = 1.725;
        const ejercicioMuyFuerte = 1.9;

        let actividadFloat = sedentarismo;
        let objetivoFloat = 0;

        const actividadClean = traductorActividad[actividad] || actividad || 'Casi nada';
        const objetivoClean = traductorObjetivo[objetivo] || objetivo || 'Mantener peso';
        const sexoClean = sexo?.toLowerCase().trim();

        if (actividadClean === 'Casi nada') {
            actividadFloat = sedentarismo;
        } else if (actividadClean === 'Poca actividad') {
            actividadFloat = ejercicioLigero;
        } else if (actividadClean === 'Moderada') {
            actividadFloat = ejercicioModerado;
        } else if (actividadClean === 'Alta actividad') {
            actividadFloat = ejercicioFuerte;
        } else if (actividadClean === 'Muy intensa') {
            actividadFloat = ejercicioMuyFuerte;
        }

        if (objetivoClean === 'Bajar peso lento') {
            objetivoFloat = -250;
        } else if (objetivoClean === 'Bajar peso rápido') {
            objetivoFloat = -500;
        } else if (objetivoClean === 'Mantener peso') {
            objetivoFloat = 0;
        } else if (objetivoClean === 'Subir peso lento') {
            objetivoFloat = 250;
        } else if (objetivoClean === 'Subir peso rápido') {
            objetivoFloat = 500;
        }

        let alturaCm = parseFloat(altura);
        if (alturaCm < 3) alturaCm = alturaCm * 100;

        const pesoKg = parseFloat(peso);
        const edadAnios = parseFloat(edad);

        if (isNaN(pesoKg) || isNaN(alturaCm) || isNaN(edadAnios)) {
            return settings.calorias;
        }

        const TMB = (10 * pesoKg) + (6.25 * alturaCm) - (5 * edadAnios) + (sexoClean === 'hombre' ? 5 : -161);
        const calories = (TMB * actividadFloat) + objetivoFloat;

        return Math.round(calories);
    };


    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title="Ajustes de Calorias"
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>
            <View style={{ backgroundColor: '#323232ff', padding: 16, margin: 16, borderRadius: 16 }} >
                <Text style={{ fontSize: 18, color: theme.colors.onPrimary, fontWeight: 'bold', marginBottom: 16 }}>
                    Calorias Diarias
                </Text>
                <View style={[styles.row, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text variant="titleMedium">Cálculo Automático</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {settings.auto
                                ? "Usando las calorías calculadas por tu perfil metabólico."
                                : "Modo manual activo. Introduce tus propios objetivos."}
                        </Text>
                    </View>
                    <Switch
                        value={settings.auto}
                        onValueChange={toggleSwitch}
                        color={theme.colors.primary}
                    />
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                        {caloryCalculator()}
                    </Text>
                    <Text style={{ fontSize: 24, color: theme.colors.primary, fontWeight: 'bold' }}>
                        Kcal
                    </Text>
                </View>
                {settings.auto === true ? (
                    <></>
                ) : (
                    <View style={{ alignItems: 'center', gap: 20, flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <TextInput label="Calorias" value={calorias} onChangeText={setCalorias} style={{ width: '45%', height: 50, borderRadius: 20, marginTop: 1 }} keyboardType='numeric' />
                        <Button mode='contained' onPress={() => { }} style={{ width: '30%', height: 50, borderRadius: 20 }} >Guardar</Button>
                    </View>
                )}
            </View>
            <View style={{ backgroundColor: '#323232ff', padding: 16, margin: 16, borderRadius: 16, marginTop: 1 }}>
                <Text style={{ fontSize: 18, color: theme.colors.onPrimary, fontWeight: 'bold', marginBottom: 16 }}>
                    Distribucion de nutrientes
                </Text>


            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 8,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: 12,
    },
    infoBox: {
        marginTop: 20,
        paddingHorizontal: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        marginBottom: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    inputsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    input: {
        flex: 1,
    },
    button: {
        borderRadius: 28,
        marginBottom: 40,
    }
});

import { CalorySettings, DistribucionType, getCalorySettings, getUserProfile, saveCalorySettings } from '@/utils/profileStorage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Chip, Surface, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

// ── Distribuciones predefinidas (% proteína, % carbos, % grasa) ──────────
const DISTRIBUCIONES: Record<Exclude<DistribucionType, 'personalizada'>, { label: string; proteinas: number; carbohidratos: number; grasas: number }> = {
    equilibrada: { label: 'Equilibrada', proteinas: 30, carbohidratos: 45, grasas: 25 },
    alta_proteina: { label: 'Alta en Proteína', proteinas: 40, carbohidratos: 30, grasas: 30 },
    cetogenica: { label: 'Cetogénica', proteinas: 20, carbohidratos: 5, grasas: 75 },
    alta_carbohidratos: { label: 'Alta en Carbohidratos', proteinas: 20, carbohidratos: 60, grasas: 20 },
};

// ── Colores para el gráfico ──────────────────────────────────────────────
const COLORS = {
    proteinas: '#1774eeff',
    carbohidratos: '#f02df0ff',
    grasas: '#ffd727ff',
};

// ── Componente PieChart con SVG ──────────────────────────────────────────
interface PieChartProps {
    proteinas: number; // porcentaje
    carbohidratos: number;
    grasas: number;
}
function PieChart({ proteinas, carbohidratos, grasas }: PieChartProps) {
    const size = 200;
    const strokeWidth = 36;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const total = proteinas + carbohidratos + grasas || 1;
    const pProt = proteinas / total;
    const pCarb = carbohidratos / total;
    const pGras = grasas / total;
    const protLen = pProt * circumference;
    const carbLen = pCarb * circumference;
    const grasLen = pGras * circumference;
    const protOffset = 0;
    const carbOffset = -protLen;
    const grasOffset = -(protLen + carbLen);
    return (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Grasas (bottom layer) */}
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke={COLORS.grasas}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${grasLen} ${circumference - grasLen}`}
                        strokeDashoffset={grasOffset}
                        fill="none"
                        strokeLinecap="butt"
                    />
                    {/* Carbohidratos */}
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke={COLORS.carbohidratos}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${carbLen} ${circumference - carbLen}`}
                        strokeDashoffset={carbOffset}
                        fill="none"
                        strokeLinecap="butt"
                    />
                    {/* Proteínas */}
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke={COLORS.proteinas}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${protLen} ${circumference - protLen}`}
                        strokeDashoffset={protOffset}
                        fill="none"
                        strokeLinecap="butt"
                    />
                </G>
                {/* Texto central */}
                <SvgText
                    x={center} y={center - 6}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#1565c0"
                >
                    Nutrientes
                </SvgText>
                <SvgText
                    x={center} y={center + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#aaaaaa"
                >
                    distribución
                </SvgText>
            </Svg>
        </View>
    );
}
// ── Pantalla principal ───────────────────────────────────────────────────
export default function CalorySettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    // Datos del perfil (para cálculo automático)
    const [altura, setAltura] = useState<string>('');
    const [peso, setPeso] = useState<string>('');
    const [edad, setEdad] = useState<string>('');
    const [sexo, setSexo] = useState('');
    const [actividad, setActividad] = useState('');
    const [objetivo, setObjetivo] = useState('');
    // Input manual de calorías
    const [caloriasInput, setCaloriasInput] = useState('');
    // Settings principal
    const [settings, setSettings] = useState<CalorySettings>({
        auto: true,
        calorias: 2000,
        proteinas: 150,
        carbohidratos: 200,
        grasas: 65,
        distribucion: 'equilibrada',
        customProteinas: 30,
        customCarbohidratos: 45,
        customGrasas: 25,
    });
    // Inputs para distribución personalizada
    const [customProt, setCustomProt] = useState('30');
    const [customCarb, setCustomCarb] = useState('45');
    const [customGras, setCustomGras] = useState('25');
    // Flag para evitar guardado automático durante la carga inicial
    const isInitialLoad = useRef(true);
    // ── Carga de datos ───────────────────────────────────────────────────
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

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await getCalorySettings();
                if (savedSettings) {
                    setSettings(savedSettings);
                    setCaloriasInput(String(savedSettings.calorias));
                    if (savedSettings.distribucion === 'personalizada') {
                        setCustomProt(String(savedSettings.customProteinas ?? 30));
                        setCustomCarb(String(savedSettings.customCarbohidratos ?? 45));
                        setCustomGras(String(savedSettings.customGrasas ?? 25));
                    }
                }
            } catch (error) {
                console.error("Error cargando configuración:", error);
            } finally {
                setLoading(false);
                // Marcamos fin de carga inicial con un pequeño delay
                setTimeout(() => { isInitialLoad.current = false; }, 500);
            }
        };
        loadSettings();
    }, []);

    // ── Cálculo automático de calorías ───────────────────────────────────
    const caloryCalculator = useCallback((): number => {
        const traductorActividad: Record<string, string> = {
            nada: 'Casi nada', poca: 'Poca actividad', media: 'Moderada', alta: 'Alta actividad', muy_intensa: 'Muy intensa',
        };
        const traductorObjetivo: Record<string, string> = {
            perder_lento: 'Bajar peso lento', perder_rapido: 'Bajar peso rápido', mantener: 'Mantener peso',
            subir_lento: 'Subir peso lento', subir_rapido: 'Subir peso rápido',
        };
        const factores: Record<string, number> = {
            'Casi nada': 1.2, 'Poca actividad': 1.375, 'Moderada': 1.55,
            'Alta actividad': 1.725, 'Muy intensa': 1.9,
        };
        const deficits: Record<string, number> = {
            'Bajar peso lento': -250, 'Bajar peso rápido': -500, 'Mantener peso': 0,
            'Subir peso lento': 250, 'Subir peso rápido': 500,
        };
        const actividadClean = traductorActividad[actividad] || actividad || 'Casi nada';
        const objetivoClean = traductorObjetivo[objetivo] || objetivo || 'Mantener peso';
        const sexoClean = sexo?.toLowerCase().trim();
        const actividadFloat = factores[actividadClean] ?? 1.2;
        const objetivoFloat = deficits[objetivoClean] ?? 0;
        let alturaCm = parseFloat(altura);
        if (alturaCm < 3) alturaCm = alturaCm * 100;
        const pesoKg = parseFloat(peso);
        const edadAnios = parseFloat(edad);
        if (isNaN(pesoKg) || isNaN(alturaCm) || isNaN(edadAnios)) {
            return settings.calorias;
        }
        const TMB = (10 * pesoKg) + (6.25 * alturaCm) - (5 * edadAnios) + (sexoClean === 'hombre' ? 5 : -161);
        return Math.round((TMB * actividadFloat) + objetivoFloat);
    }, [altura, peso, edad, sexo, actividad, objetivo, settings.calorias]);
    // ── Calorías efectivas (auto vs manual) ──────────────────────────────
    const caloriasEfectivas = settings.auto ? caloryCalculator() : settings.calorias;
    // ── Porcentajes según distribución ───────────────────────────────────
    const porcentajes = useMemo(() => {
        if (settings.distribucion === 'personalizada') {
            return {
                proteinas: parseFloat(customProt) || 0,
                carbohidratos: parseFloat(customCarb) || 0,
                grasas: parseFloat(customGras) || 0,
            };
        }
        const dist = DISTRIBUCIONES[settings.distribucion] || DISTRIBUCIONES.equilibrada;
        return { proteinas: dist.proteinas, carbohidratos: dist.carbohidratos, grasas: dist.grasas };
    }, [settings.distribucion, customProt, customCarb, customGras]);
    // ── Gramos calculados ────────────────────────────────────────────────
    const gramos = useMemo(() => {
        const totalPct = porcentajes.proteinas + porcentajes.carbohidratos + porcentajes.grasas;
        if (totalPct === 0) return { proteinas: 0, carbohidratos: 0, grasas: 0 };
        // Normalizar porcentajes
        const pP = porcentajes.proteinas / totalPct;
        const pC = porcentajes.carbohidratos / totalPct;
        const pG = porcentajes.grasas / totalPct;
        return {
            proteinas: Math.round((caloriasEfectivas * pP) / 4),        // 4 kcal/g
            carbohidratos: Math.round((caloriasEfectivas * pC) / 4),    // 4 kcal/g
            grasas: Math.round((caloriasEfectivas * pG) / 9),           // 9 kcal/g
        };
    }, [caloriasEfectivas, porcentajes]);
    // ── Guardado automático (modo auto) ──────────────────────────────────
    useEffect(() => {
        if (isInitialLoad.current || !settings.auto) return;
        const newSettings: CalorySettings = {
            ...settings,
            calorias: caloriasEfectivas,
            proteinas: gramos.proteinas,
            carbohidratos: gramos.carbohidratos,
            grasas: gramos.grasas,
            customProteinas: parseFloat(customProt) || 30,
            customCarbohidratos: parseFloat(customCarb) || 45,
            customGrasas: parseFloat(customGras) || 25,
        };
        saveCalorySettings(newSettings);
    }, [settings.auto, settings.distribucion, caloriasEfectivas, gramos, customProt, customCarb, customGras]);
    // ── Handlers ─────────────────────────────────────────────────────────
    const toggleSwitch = () => {
        setSettings(prev => ({ ...prev, auto: !prev.auto }));
    };
    const selectDistribucion = (dist: DistribucionType) => {
        setSettings(prev => ({ ...prev, distribucion: dist }));
    };
    const guardarManual = () => {
        const cal = parseInt(caloriasInput, 10);
        if (!isNaN(cal) && cal > 0) {
            setSettings(prev => ({ ...prev, calorias: cal }));
        }
    };
    const guardarTodo = async () => {
        const cal = settings.auto ? caloriasEfectivas : settings.calorias;
        const newSettings: CalorySettings = {
            ...settings,
            calorias: cal,
            proteinas: gramos.proteinas,
            carbohidratos: gramos.carbohidratos,
            grasas: gramos.grasas,
            customProteinas: parseFloat(customProt) || 30,
            customCarbohidratos: parseFloat(customCarb) || 45,
            customGrasas: parseFloat(customGras) || 25,
        };
        await saveCalorySettings(newSettings);
        router.back();
    };
    // ── Suma de porcentajes personalizada ─────────────────────────────────
    const sumaCustom = (parseFloat(customProt) || 0) + (parseFloat(customCarb) || 0) + (parseFloat(customGras) || 0);
    const customValido = Math.abs(sumaCustom - 100) < 0.5;
    // ── RENDER ───────────────────────────────────────────────────────────
    const cardBg = '#323232ff';
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

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} keyboardShouldPersistTaps="handled">
                {/* ── SECCIÓN: Calorías Diarias ───────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Calorías Diarias</Text>
                    <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text variant="titleMedium">Cálculo Automático</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {settings.auto
                                    ? "Usando las calorías calculadas por tu perfil metabólico."
                                    : "Modo manual activo. Introduce tus propios objetivos."}
                            </Text>
                        </View>
                        <Switch value={settings.auto} onValueChange={toggleSwitch} color={theme.colors.primary} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 32, color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                            {caloriasEfectivas}
                        </Text>
                        <Text style={{ fontSize: 24, color: theme.colors.primary, fontWeight: 'bold' }}>
                            Kcal
                        </Text>
                    </View>
                    {!settings.auto && (
                        <View style={{ alignItems: 'center', gap: 12, flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                            <TextInput
                                label="Calorías"
                                value={caloriasInput}
                                onChangeText={setCaloriasInput}
                                style={{ width: '45%', height: 50 }}
                                keyboardType="numeric"
                                mode="outlined"
                            />
                            <Button mode="contained" onPress={guardarManual} style={{ borderRadius: 20, height: 50, justifyContent: 'center' }}>
                                Guardar
                            </Button>
                        </View>
                    )}
                </View>
                {/* ── SECCIÓN: Distribución de nutrientes ─────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Distribución de Nutrientes</Text>
                    {/* Chips de distribuciones */}
                    <View style={styles.chipsContainer}>
                        {(Object.keys(DISTRIBUCIONES) as Exclude<DistribucionType, 'personalizada'>[]).map((key) => (
                            <Chip
                                key={key}
                                selected={settings.distribucion === key}
                                onPress={() => selectDistribucion(key)}
                                style={[
                                    styles.chip,
                                    { backgroundColor: theme.colors.surfaceVariant },
                                    settings.distribucion === key && { backgroundColor: theme.colors.primary },
                                ]}
                                textStyle={{
                                    color: settings.distribucion === key ? theme.colors.onPrimary : theme.colors.onSurface,
                                    fontSize: 13,
                                }}
                                showSelectedOverlay={false}
                            >
                                {DISTRIBUCIONES[key].label}
                            </Chip>
                        ))}
                        <Chip
                            selected={settings.distribucion === 'personalizada'}
                            onPress={() => selectDistribucion('personalizada')}
                            style={[
                                styles.chip,
                                { backgroundColor: theme.colors.surfaceVariant },
                                settings.distribucion === 'personalizada' && { backgroundColor: theme.colors.primary },
                            ]}
                            textStyle={{
                                color: settings.distribucion === 'personalizada' ? theme.colors.onPrimary : theme.colors.onSurface,
                                fontSize: 13,
                            }}
                            showSelectedOverlay={false}
                            icon="pencil"
                        >
                            Personalizada
                        </Chip>
                    </View>
                    {/* Campos personalizados */}
                    {settings.distribucion === 'personalizada' && (
                        <View style={[styles.customInputsContainer, { backgroundColor: theme.colors.surface }]}>
                            <Text variant="labelLarge" style={{ color: '#ccc', marginBottom: 8 }}>
                                Define tus porcentajes (deben sumar 100%)
                            </Text>
                            <View style={styles.customInputRow}>
                                <View style={styles.customInputWrapper}>
                                    <View style={[styles.colorDot, { backgroundColor: COLORS.proteinas }]} />
                                    <TextInput
                                        label="Proteínas %"
                                        value={customProt}
                                        onChangeText={setCustomProt}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.customInput}
                                        dense
                                    />
                                </View>
                                <View style={styles.customInputWrapper}>
                                    <View style={[styles.colorDot, { backgroundColor: COLORS.carbohidratos }]} />
                                    <TextInput
                                        label="Carbos %"
                                        value={customCarb}
                                        onChangeText={setCustomCarb}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.customInput}
                                        dense
                                    />
                                </View>
                                <View style={styles.customInputWrapper}>
                                    <View style={[styles.colorDot, { backgroundColor: COLORS.grasas }]} />
                                    <TextInput
                                        label="Grasas %"
                                        value={customGras}
                                        onChangeText={setCustomGras}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.customInput}
                                        dense
                                    />
                                </View>
                            </View>
                            <Text
                                variant="bodySmall"
                                style={{
                                    color: customValido ? '#81C784' : '#E57373',
                                    textAlign: 'center',
                                    marginTop: 4,
                                }}
                            >
                                {customValido ? `✓ Suma: ${sumaCustom}%` : `✗ Suma actual: ${sumaCustom}% (debe ser 100%)`}
                            </Text>
                        </View>
                    )}
                    {/* Gráfica circular */}
                    <PieChart
                        proteinas={porcentajes.proteinas}
                        carbohidratos={porcentajes.carbohidratos}
                        grasas={porcentajes.grasas}
                    />
                    {/* Leyenda */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.proteinas }]} />
                            <Text style={styles.legendLabel}>Proteínas</Text>
                            <Text style={[styles.legendPercent, { color: theme.colors.onSurface }]}>{Math.round(porcentajes.proteinas)}%</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.carbohidratos }]} />
                            <Text style={[styles.legendLabel, { color: theme.colors.onSurface }]}>Carbohidratos</Text>
                            <Text style={[styles.legendPercent, { color: theme.colors.onSurface }]}>{Math.round(porcentajes.carbohidratos)}%</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.grasas }]} />
                            <Text style={[styles.legendLabel, { color: theme.colors.onSurface }]}>Grasas</Text>
                            <Text style={[styles.legendPercent, { color: theme.colors.onSurface }]}>{Math.round(porcentajes.grasas)}%</Text>
                        </View>
                    </View>
                </View>
                {/* ── SECCIÓN: Gramos por nutriente ───────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={styles.cardTitle}>Gramos por Nutriente</Text>
                    <Text variant="bodySmall" style={{ color: '#aaa', marginBottom: 12 }}>
                        Basado en {caloriasEfectivas} kcal diarias
                    </Text>
                    <View style={styles.gramosRow}>
                        <View style={[styles.gramosCard, { borderColor: COLORS.proteinas, backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.gramosValue, { color: COLORS.proteinas }]}>{gramos.proteinas}g</Text>
                            <Text style={styles.gramosLabel}>Proteínas</Text>
                            <Text style={styles.gramosKcal}>{gramos.proteinas * 4} kcal</Text>
                        </View>
                        <View style={[styles.gramosCard, { borderColor: COLORS.carbohidratos, backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.gramosValue, { color: COLORS.carbohidratos }]}>{gramos.carbohidratos}g</Text>
                            <Text style={styles.gramosLabel}>Carbohidratos</Text>
                            <Text style={styles.gramosKcal}>{gramos.carbohidratos * 4} kcal</Text>
                        </View>
                        <View style={[styles.gramosCard, { borderColor: COLORS.grasas, backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.gramosValue, { color: COLORS.grasas }]}>{gramos.grasas}g</Text>
                            <Text style={styles.gramosLabel}>Grasas</Text>
                            <Text style={styles.gramosKcal}>{gramos.grasas * 9} kcal</Text>
                        </View>
                    </View>
                </View>
                {/* ── BOTÓN GUARDAR TODO ───────────────────────────────────────── */}
                <Button
                    mode="contained"
                    onPress={guardarTodo}
                    style={styles.saveButton}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold', paddingVertical: 4 }}
                    icon="content-save"
                >
                    Guardar todos los cambios
                </Button>
            </ScrollView>
        </Surface>
    );
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    card: {
        padding: 16,
        margin: 16,
        borderRadius: 16,
        marginBottom: 2,
        borderColor: "#5a5a5aff",
        borderWidth: 1.2,

    },
    cardTitle: {
        fontSize: 18,

        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        borderRadius: 20,
    },
    customInputsContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
    },
    customInputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    customInputWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 4,
    },
    customInput: {
        width: '100%',
        fontSize: 13,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 4,
    },
    legendItem: {
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendLabel: {
        fontSize: 12,
    },
    legendPercent: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    gramosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    gramosCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    gramosValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    gramosLabel: {
        fontSize: 11,
        color: '#cccccc',
        marginTop: 4,
    },
    gramosKcal: {
        fontSize: 10,
        color: '#888888',
        marginTop: 2,
    },
    saveButton: {
        margin: 16,
        borderRadius: 28,
        marginTop: 16,
    },
});
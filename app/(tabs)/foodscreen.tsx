import { AlimentoItem } from '@/components/alimento-item';
import { ConsumedFood, getConsumedFoodsByDate } from '@/utils/consumedStorage';
// 1. Asegúrate de importar getCalorySettings y CalorySettings (ya los tenías)
import { CalorySettings, getCalorySettings } from '@/utils/profileStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Card,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

type MacroItem = {
  label: string;
  consumed: number;
  target: number;
  color: string;
};

const DEFAULT_SETTINGS = {
  calorias: 2000,
  carbohidratos: 200,
  proteinas: 150,
  grasas: 70,
};

const formatDate = (value: Date) =>
  value.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function FoodScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [consumedFoods, setConsumedFoods] = useState<ConsumedFood[]>([]);

  const [targets, setTargets] = useState<CalorySettings | null>(null);

  const formattedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const dateStr = selectedDate.toISOString().split('T')[0];

      Promise.all([
        getConsumedFoodsByDate(dateStr),
        getCalorySettings()
      ]).then(([foods, settings]) => {
        if (!isMounted) return;

        setConsumedFoods(foods);
        if (settings) {
          setTargets(settings);
        }
      }).catch(err => console.error("Error cargando datos: ", err));

      return () => {
        isMounted = false;
      };
    }, [selectedDate])
  );

  const activeTargets = useMemo(() => {
    return {
      kcal: targets?.calorias ?? DEFAULT_SETTINGS.calorias,
      carbs: targets?.carbohidratos ?? DEFAULT_SETTINGS.carbohidratos,
      protein: targets?.proteinas ?? DEFAULT_SETTINGS.proteinas,
      fat: targets?.grasas ?? DEFAULT_SETTINGS.grasas,
    };
  }, [targets]);

  const totals = useMemo(() => {
    let kcal = 0;
    let carbs = 0;
    let protein = 0;
    let fat = 0;

    consumedFoods.forEach((food) => {
      kcal += parseFloat(food.calorias) || 0;
      carbs += parseFloat(food.carbohidratos) || 0;
      protein += parseFloat(food.proteinas) || 0;
      fat += parseFloat(food.grasas) || 0;
    });

    return {
      kcal: Math.round(kcal),
      carbs: parseFloat(carbs.toFixed(1)),
      protein: parseFloat(protein.toFixed(1)),
      fat: parseFloat(fat.toFixed(1)),
    };
  }, [consumedFoods]);

  const mealGroups = useMemo(() => {
    const groups: Record<
      string,
      { items: any[]; carbs: number; protein: number; fat: number; kcal: number }
    > = {
      Desayuno: { items: [], carbs: 0, protein: 0, fat: 0, kcal: 0 },
      Comida: { items: [], carbs: 0, protein: 0, fat: 0, kcal: 0 },
      Cena: { items: [], carbs: 0, protein: 0, fat: 0, kcal: 0 },
    };

    consumedFoods.forEach((food) => {
      const mealName = food.comida || 'Desayuno';
      if (!groups[mealName]) {
        groups[mealName] = { items: [], carbs: 0, protein: 0, fat: 0, kcal: 0 };
      }
      groups[mealName].items.push(food);
      groups[mealName].carbs += parseFloat(food.carbohidratos) || 0;
      groups[mealName].protein += parseFloat(food.proteinas) || 0;
      groups[mealName].fat += parseFloat(food.grasas) || 0;
      groups[mealName].kcal += parseFloat(food.calorias) || 0;
    });

    Object.keys(groups).forEach((key) => {
      groups[key].carbs = parseFloat(groups[key].carbs.toFixed(1));
      groups[key].protein = parseFloat(groups[key].protein.toFixed(1));
      groups[key].fat = parseFloat(groups[key].fat.toFixed(1));
      groups[key].kcal = Math.round(groups[key].kcal);
    });

    return groups;
  }, [consumedFoods]);

  const macroData = useMemo<MacroItem[]>(
    () => [
      { label: 'Carbohidratos', consumed: totals.carbs, target: activeTargets.carbs, color: totals.carbs > activeTargets.carbs ? '#ef5350' : '#e040fb' },
      { label: 'Proteínas', consumed: totals.protein, target: activeTargets.protein, color: totals.protein > activeTargets.protein ? '#ef5350' : '#1e88e5' },
      { label: 'Grasas', consumed: totals.fat, target: activeTargets.fat, color: totals.fat > activeTargets.fat ? '#ef5350' : '#fbc02d' },
    ],
    [totals, activeTargets]
  );

  const changeDay = (days: number) => {
    setSelectedDate((prevDate) => {
      const nextDate = new Date(prevDate);
      nextDate.setDate(nextDate.getDate() + days);
      return nextDate;
    });
  };

  const circleSize = 210;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;


  const arcLength = circumference * (240 / 360);


  const kcalRatio = Math.min(totals.kcal / activeTargets.kcal, 1);

  return (
    <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
        <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Alimentación" titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }} />
        </Appbar.Header>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Fila de progreso de Macros */}
        <View style={styles.macroRow}>
          {macroData.map((macro) => {
            const ratio = macro.target > 0 ? Math.min(macro.consumed / macro.target, 1) : 0;
            return (
              <View key={macro.label} style={styles.macroItem}>
                <View style={[styles.progressTrack, { backgroundColor: theme.dark ? '#3a3a3c' : '#e0e0e0', overflow: 'hidden' }]}>
                  <View style={{ height: '100%', width: `${ratio * 100}%`, backgroundColor: macro.color, borderRadius: 999 }} />
                </View>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                  {Math.round(macro.consumed)} / {macro.target}g
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {macro.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Círculo de calorías */}
        <View style={styles.kcalCircleContainer}>
          <Svg width={circleSize} height={circleSize}>
            <G rotation="150" origin={`${circleSize / 2}, ${circleSize / 2}`}>
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={theme.dark ? '#3a3a3c' : '#e0e0e0'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                fill="transparent"
                strokeLinecap="round"
              />
              {kcalRatio > 0 && (
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={totals.kcal > activeTargets.kcal ? '#ef5350' : '#3a86f5'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${kcalRatio * arcLength} ${circumference}`}
                  fill="transparent"
                  strokeLinecap="round"
                />
              )}
            </G>
          </Svg>
          <View style={styles.kcalCircleTextContainer}>
            <Text style={{ fontWeight: '700', fontSize: 44, color: theme.colors.onBackground }}>{totals.kcal}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: -4 }}>kcal consumidas</Text>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>de {activeTargets.kcal}</Text>
          </View>
        </View>

        {/* Barra de fecha */}
        <Surface style={[styles.dateBar, { backgroundColor: '#3a86f5' }]} elevation={1}>
          <IconButton icon="chevron-left" size={28} onPress={() => changeDay(-1)} iconColor="#ffffff" />
          <Text variant="titleMedium" style={[styles.dateText, { color: '#ffffff', fontWeight: 'bold' }]}>{formattedDate}</Text>
          <IconButton icon="chevron-right" size={28} onPress={() => changeDay(1)} iconColor="#ffffff" />
        </Surface>

        {/* Lista de comidas (Mapeo optimizado con tu componente AlimentoItem) */}
        {['Desayuno', 'Comida', 'Cena'].map((mealName) => (
          <Card key={mealName} mode="outlined" style={[styles.mealCard, { borderColor: theme.colors.outline }]}>
            <Card.Title
              title={mealName}
              titleStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}
              style={{ backgroundColor: '#2a62bf', minHeight: 48 }}
            />

            {/* Contenido con espaciado limpio para tus componentes hijos */}
            <Card.Content style={[styles.mealBody, { backgroundColor: theme.colors.surface, paddingVertical: 6, gap: 4 }]}>
              {mealGroups[mealName].items.length === 0 ? (
                <View style={styles.emptyMealContainer}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    No hay alimentos
                  </Text>
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  {mealGroups[mealName].items.map((item, idx) => (
                    <AlimentoItem
                      key={item.id || idx}
                      alimento={item}
                      onPress={() => {
                        router.push({
                          pathname: '/delOrUpItem', // 👈 Tu pantalla destino
                          params: {
                            id: item.id,
                            email: item.email,
                            nombreAlimento: item.nombreAlimento,
                            marca: item.marca,
                            medida: item.medida,
                            cantidad: item.cantidad,
                            calorias: item.calorias,
                            carbohidratos: item.carbohidratos,
                            proteinas: item.proteinas,
                            grasas: item.grasas,
                            descripcion: item.descripcion,
                            fecha: item.fecha,
                            comida: item.comida,
                            type: 'alimento'
                          },
                        });
                      }}
                    />
                  ))}
                </View>
              )}
            </Card.Content>

            {/* Bloque resumen de macros de la comida */}
            <View style={[styles.summaryBlock, { backgroundColor: theme.colors.surfaceVariant, borderTopColor: theme.colors.outline }]}>
              <View style={styles.summaryRow}>
                <Text variant="titleMedium" style={[styles.carbsColor, { fontWeight: 'bold' }]}>{mealGroups[mealName].carbs}</Text>
                <Text variant="titleMedium" style={[styles.proteinColor, { fontWeight: 'bold' }]}>{mealGroups[mealName].protein}</Text>
                <Text variant="titleMedium" style={[styles.fatColor, { fontWeight: 'bold' }]}>{mealGroups[mealName].fat}</Text>
                <Text variant="titleMedium" style={[styles.kcalColor, { fontWeight: 'bold' }]}>{mealGroups[mealName].kcal}</Text>
              </View>
              <View style={styles.summaryLabelsRow}>
                <Text variant="labelSmall" style={[styles.carbsColor, styles.summaryLabel]}>Carbohidratos</Text>
                <Text variant="labelSmall" style={[styles.proteinColor, styles.summaryLabel]}>Proteinas</Text>
                <Text variant="labelSmall" style={[styles.fatColor, styles.summaryLabel]}>Grasas</Text>
                <Text variant="labelSmall" style={[styles.kcalColor, styles.summaryLabel]}>Kcal</Text>
              </View>
            </View>

            {/* Acción para añadir más alimentos */}
            <Card.Actions style={{ backgroundColor: '#2a62bf', justifyContent: 'center', paddingVertical: 0, height: 48 }}>
              <IconButton
                icon="plus"
                iconColor="#ffffff"
                size={28}
                onPress={() =>
                  router.push({
                    pathname: '/misAlimentos',
                    params: {
                      fecha: selectedDate.toISOString().split('T')[0],
                      comida: mealName,
                    },
                  })
                }
              />
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {},
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 34, gap: 16 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  macroItem: { width: '30%', alignItems: 'center', gap: 6 },
  progressTrack: { alignSelf: 'stretch', height: 12, borderRadius: 999 },
  kcalCircleContainer: { alignSelf: 'center', width: 210, height: 210, justifyContent: 'center', alignItems: 'center', position: 'relative', marginVertical: 16 },
  kcalCircleTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  dateBar: { height: 54, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginVertical: 8 },
  dateText: { textTransform: 'capitalize', flex: 1, textAlign: 'center' },
  mealCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e5ea' },
  mealBody: { minHeight: 74, paddingHorizontal: 4 },
  emptyMealContainer: { minHeight: 74, justifyContent: 'center', alignItems: 'center' },
  summaryBlock: { paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#e5e5ea' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryLabelsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  summaryLabel: { flex: 1, textAlign: 'center' },
  carbsColor: { color: '#d85cf6' },
  proteinColor: { color: '#0f59bf' },
  fatColor: { color: '#eaa129' },
  kcalColor: { color: '#2a62bf' },
});

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

type MacroItem = {
  label: string;
  consumed: number;
  target: number;
};

const macroData: MacroItem[] = [
  { label: 'Carbohidratos', consumed: 0, target: 100 },
  { label: 'Proteinas', consumed: 0, target: 100 },
  { label: 'Grasas', consumed: 0, target: 100 },
];

const kcalTarget = 2000;

const formatDate = (value: Date) =>
  value.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function FoodScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const formattedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);
  const totalConsumedKcal = 0;

  const changeDay = (days: number) => {
    setSelectedDate((prevDate) => {
      const nextDate = new Date(prevDate);
      nextDate.setDate(nextDate.getDate() + days);
      return nextDate;
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alimentacion</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.macroRow}>
          {macroData.map((macro) => (
            <View key={macro.label} style={styles.macroItem}>
              <View style={styles.progressTrack} />
              <Text style={styles.macroValue}>
                {macro.consumed} / {macro.target}g
              </Text>
              <Text style={styles.macroLabel}>{macro.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.kcalCircle}>
          <Text style={styles.kcalValue}>{totalConsumedKcal}</Text>
          <Text style={styles.kcalText}>kcal consumidas</Text>
          <Text style={styles.kcalTargetText}>de {kcalTarget}</Text>
        </View>

        <View style={styles.dateBar}>
          <Pressable onPress={() => changeDay(-1)} hitSlop={8}>
            <Text style={styles.arrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Pressable onPress={() => changeDay(1)} hitSlop={8}>
            <Text style={styles.arrow}>{'>'}</Text>
          </Pressable>
        </View>

        {['Desayuno', 'Comida'].map((mealName) => (
          <View style={styles.mealCard} key={mealName}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{mealName}</Text>
            </View>
            <View style={styles.mealBody}>
              <Text style={styles.emptyText}>No hay alimentos</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, styles.carbsColor]}>0</Text>
              <Text style={[styles.summaryValue, styles.proteinColor]}>0</Text>
              <Text style={[styles.summaryValue, styles.fatColor]}>0</Text>
              <Text style={[styles.summaryValue, styles.kcalColor]}>0</Text>
            </View>
            <View style={styles.summaryLabelsRow}>
              <Text style={[styles.summaryLabel, styles.carbsColor]}>Carbohidratos</Text>
              <Text style={[styles.summaryLabel, styles.proteinColor]}>Proteinas</Text>
              <Text style={[styles.summaryLabel, styles.fatColor]}>Grasas</Text>
              <Text style={[styles.summaryLabel, styles.kcalColor]}>Kcal</Text>
            </View>
            <Pressable style={styles.addButton} onPress={() => router.push('/misAlimentos' as never)}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#1565c0',
    paddingTop: 56,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 34,
    gap: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e0e0e0',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131313',
  },
  macroLabel: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  kcalCircle: {
    alignSelf: 'center',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 8,
    borderColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  kcalValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
  },
  kcalText: {
    fontSize: 18,
    color: '#707070',
  },
  kcalTargetText: {
    fontSize: 19,
    color: '#4f4f4f',
  },
  dateBar: {
    height: 54,
    borderRadius: 32,
    backgroundColor: '#4a90dd',
    borderWidth: 2,
    borderColor: '#0f5bb2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  arrow: {
    fontSize: 38,
    color: '#091a35',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 20,
    color: '#091a35',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  mealCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2f3a4b',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mealHeader: {
    backgroundColor: '#1565c0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  mealTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  mealBody: {
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  summaryRow: {
    backgroundColor: '#d9dde3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryLabelsRow: {
    backgroundColor: '#d9dde3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
  },
  carbsColor: {
    color: '#d85cf6',
  },
  proteinColor: {
    color: '#0f59bf',
  },
  fatColor: {
    color: '#eaa129',
  },
  kcalColor: {
    color: '#2a62bf',
  },
  addButton: {
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
});

import { Pressable, StyleSheet, Text, View, type PressableProps, type TextStyle } from 'react-native';

/** Datos de un alimento para la fila (equivalente al modelo `Alimento` en Kotlin). */
export type AlimentoListItem = {
  nombreAlimento: string;
  cantidad: string;
  medida: string;
  calorias: string;
  carbohidratos: string;
  proteinas: string;
  grasas: string;
};

export type MacroMiniTextProps = {
  label: string;
  value: string;
  color: string;
};

export type AlimentoItemProps = {
  alimento: AlimentoListItem;
  onPress?: PressableProps['onPress'];
};

/** Igual que en Kotlin: coma → punto, double → int como string, o "0". */
export function safeToIntString(valor: string): string {
  const parsed = Number.parseFloat(valor.replace(',', '.'));
  if (!Number.isFinite(parsed)) return '0';
  return Math.trunc(parsed).toString();
}

const palette = {
  negroPuro: '#000000',
  grisFuerte: '#5c5c5c',
  grisSuave: '#9e9e9e',
  azulCalorias: '#2a62bf',
  rosaCarbos: '#d85cf6',
  azulProte: '#0f59bf',
  amarilloGrasas: '#eaa129',
} as const;

export function MacroMiniText({ label, value, color }: MacroMiniTextProps) {
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{`${label}: `}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
    </View>
  );
}

export function AlimentoItem({ alimento, onPress }: AlimentoItemProps) {
  const kcal = safeToIntString(alimento.calorias);
  const c = safeToIntString(alimento.carbohidratos);
  const p = safeToIntString(alimento.proteinas);
  const g = safeToIntString(alimento.grasas);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}>
      <View style={styles.leftColumn}>
        <Text style={styles.title}>{alimento.nombreAlimento}</Text>
        <Text style={styles.subtitle}>
          {alimento.cantidad} {alimento.medida}
        </Text>
      </View>
      <View style={styles.rightColumn}>
        <Text style={styles.kcal}>{`${kcal} kcal`}</Text>
        <View style={styles.macrosRow}>
          <MacroMiniText label="C" value={c} color={palette.rosaCarbos} />
          <MacroMiniText label="P" value={p} color={palette.azulProte} />
          <MacroMiniText label="G" value={g} color={palette.amarilloGrasas} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
  },
  containerPressed: {
    opacity: 0.85,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  title: {
    color: palette.negroPuro,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.grisFuerte,
    fontSize: 13,
    marginTop: 2,
  },
  kcal: {
    color: palette.azulCalorias,
    fontSize: 15,
    fontWeight: '700',
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroLabel: {
    color: palette.grisSuave,
    fontSize: 11,
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '700',
  } satisfies TextStyle,
});

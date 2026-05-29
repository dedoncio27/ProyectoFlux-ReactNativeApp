import { StyleSheet, View, type PressableProps } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';


export type AlimentoListItem = {
  nombreAlimento: string;
  cantidad: string;
  marca?: string;
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


export function safeToIntString(valor: string): string {
  const parsed = Number.parseFloat(valor.replace(',', '.'));
  if (!Number.isFinite(parsed)) return '0';
  return Math.trunc(parsed).toString();
}

const macroPalette = {
  azulCalorias: '#2a62bf',
  rosaCarbos: '#d85cf6',
  azulProte: '#0f59bf',
  amarilloGrasas: '#eaa129',
} as const;

export function MacroMiniText({ label, value, color }: MacroMiniTextProps) {
  const theme = useTheme();
  return (
    <View style={styles.macroRow}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {`${label}: `}
      </Text>
      <Text variant="labelSmall" style={{ color, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

export function AlimentoItem({ alimento, onPress }: AlimentoItemProps) {
  const theme = useTheme();
  const kcal = safeToIntString(alimento.calorias);
  const c = safeToIntString(alimento.carbohidratos);
  const p = safeToIntString(alimento.proteinas);
  const g = safeToIntString(alimento.grasas);

  return (
    <Card mode="outlined" style={styles.card} onPress={onPress ?? undefined}>
      <Card.Content style={styles.content}>
        <View style={styles.leftColumn}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {alimento.nombreAlimento}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {alimento.cantidad} {alimento.medida}
            </Text>
            {alimento.marca != undefined && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                (Marca: {alimento.marca})
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text variant="titleSmall" style={{ color: macroPalette.azulCalorias, fontWeight: '700' }}>
            {`${kcal} kcal`}
          </Text>
          <View style={styles.macrosRow}>
            <MacroMiniText label="C" value={c} color={macroPalette.rosaCarbos} />
            <MacroMiniText label="P" value={p} color={macroPalette.azulProte} />
            <MacroMiniText label="G" value={g} color={macroPalette.amarilloGrasas} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 2,
    marginHorizontal: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  rightColumn: {
    alignItems: 'flex-end',
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
});

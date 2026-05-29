import { getUserProfile, saveUserProfile } from '@/utils/profileStorage'; // Ajusta la ruta
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Appbar, Avatar, Button, Card, Chip, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configurar el calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';


const actividadLabels: Record<string, string> = {
  nada: 'Casi nada', poca: 'Poca actividad', media: 'Moderada', alta: 'Alta actividad', muy_intensa: 'Muy intensa',
};

const objetivoLabels: Record<string, string> = {
  perder_lento: 'Bajar peso lento', perder_rapido: 'Bajar peso rápido', mantener: 'Mantener peso',
  subir_lento: 'Subir peso lento', subir_rapido: 'Subir peso rápido',
};

export const MAPEAR_VALORES_METABOLICOS = {
  actividad: {
    nada: 'Casi nada',
    poca: 'Poca actividad',
    media: 'Moderada',
    alta: 'Alta actividad',
    muy_intensa: 'Muy intensa',
  },
  objetivo: {
    perder_lento: 'Bajar peso lento',
    perder_rapido: 'Bajar peso rápido',
    mantener: 'Mantener peso',
    subir_lento: 'Subir peso lento',
    subir_rapido: 'Subir peso rápido',
  }
};

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [actividad, setActividad] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const [sexoMenuOpen, setSexoMenuOpen] = useState(false);
  const [actividadMenuOpen, setActividadMenuOpen] = useState(false);
  const [objetivoMenuOpen, setObjetivoMenuOpen] = useState(false);

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSave = async () => {
    if (!altura || !peso || !edad) {
      Alert.alert('Campos incompletos', 'Por favor, rellena peso, altura y edad.');
      return;
    }
    setIsSaving(true);
    try {
      await saveUserProfile({ altura, peso, edad, sexo, actividad, objetivo });
      toggleExpand();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar.');
    } finally {
      setIsSaving(false);
    }

    router.navigate('/calorySettings')
  };

  return (
    <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
      <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
        <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Principal" titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }} />
        </Appbar.Header>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={!isExpanded ? toggleExpand : undefined} elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.userInfoRow}>
                <Avatar.Icon size={44} icon={sexo === 'mujer' ? 'gender-female' : 'gender-male'} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
                <View style={styles.headerTextContainer}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>Mi Estado Metabólico</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {isExpanded ? 'Modificando datos actuales' : 'Toca para editar tus métricas'}
                  </Text>
                </View>
              </View>
              {!isExpanded && <Button icon="pencil-outline" mode="text" onPress={toggleExpand}>Editar</Button>}
            </View>

            {/* Envolvemos el contenido dinámico en un contenedor animado aislado */}
            <Animated.View layout={LinearTransition.duration(250)}>
              {!isExpanded ? (
                <View style={styles.resumeContainer}>
                  <View style={styles.row}>
                    <Chip icon="human-male-height" style={styles.chip}>{altura ? `${altura} cm` : '--'}</Chip>
                    <Chip icon="weight-kilogram" style={styles.chip}>{peso ? `${peso} Kg` : '--'}</Chip>
                    <Chip icon="cake-variant" style={styles.chip}>{edad ? `${edad} años` : '--'}</Chip>
                  </View>
                  <View style={[styles.row, { marginTop: 8 }]}>
                    {actividad ? <Chip icon="run" style={styles.chip}>{actividadLabels[actividad]}</Chip> : null}
                    {objetivo ? <Chip icon="trophy" style={styles.chip}>{objetivoLabels[objetivo]}</Chip> : null}
                  </View>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.inputRow}>
                    <TextInput mode="outlined" label="Altura (cm)" value={altura} onChangeText={setAltura} keyboardType="number-pad" style={[styles.flexInput, { marginRight: 8 }]} />
                    <TextInput mode="outlined" label="Peso (Kg)" value={peso} onChangeText={setPeso} keyboardType="number-pad" style={[styles.flexInput, { marginLeft: 8 }]} />
                  </View>

                  <TextInput mode="outlined" label="Edad" value={edad} onChangeText={setEdad} keyboardType="number-pad" style={styles.fullInput} />

                  <View style={styles.dropdownField}>
                    <Text variant="labelMedium" style={styles.dropdownLabel}>Sexo</Text>
                    <Menu visible={sexoMenuOpen} onDismiss={() => setSexoMenuOpen(false)} anchor={
                      <Button mode="outlined" onPress={() => setSexoMenuOpen(true)} style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                        {sexo === 'hombre' ? 'Hombre' : sexo === 'mujer' ? 'Mujer' : 'Seleccionar'}
                      </Button>
                    }>
                      <Menu.Item onPress={() => { setSexo('hombre'); setSexoMenuOpen(false); }} title="Hombre" />
                      <Menu.Item onPress={() => { setSexo('mujer'); setSexoMenuOpen(false); }} title="Mujer" />
                    </Menu>
                  </View>

                  <View style={styles.dropdownField}>
                    <Text variant="labelMedium" style={styles.dropdownLabel}>Actividad física</Text>
                    <Menu visible={actividadMenuOpen} onDismiss={() => setActividadMenuOpen(false)} anchor={
                      <Button mode="outlined" onPress={() => setActividadMenuOpen(true)} style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                        {actividad ? actividadLabels[actividad] ?? 'Seleccionar' : 'Seleccionar'}
                      </Button>
                    }>
                      {Object.entries(actividadLabels).map(([key, label]) => (
                        <Menu.Item key={key} onPress={() => { setActividad(key); setActividadMenuOpen(false); }} title={label} />
                      ))}
                    </Menu>
                  </View>

                  <View style={styles.dropdownField}>
                    <Text variant="labelMedium" style={styles.dropdownLabel}>Objetivo personal</Text>
                    <Menu visible={objetivoMenuOpen} onDismiss={() => setObjetivoMenuOpen(false)} anchor={
                      <Button mode="outlined" onPress={() => setObjetivoMenuOpen(true)} style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                        {objetivoLabels[objetivo] ?? 'Seleccionar'}
                      </Button>
                    }>
                      {Object.entries(objetivoLabels).map(([key, label]) => (
                        <Menu.Item key={key} onPress={() => { setObjetivo(key); setObjetivoMenuOpen(false); }} title={label} />
                      ))}
                    </Menu>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <Button mode="text" onPress={toggleExpand} style={{ marginRight: 8 }} disabled={isSaving}>Cancelar</Button>
                    <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving} style={styles.saveBtn}>Guardar</Button>
                  </View>
                </View>
              )}
            </Animated.View>
          </Card.Content>
        </Card>

        {/* CALENDARIO ESTILIZADO */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Seguimiento Diario</Text>
        <Card style={[styles.calendarCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Calendar
            key={theme.dark ? 'calendar-dark' : 'calendar-light'}
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: theme.colors.primary,
                selectedTextColor: theme.colors.onPrimary
              }
            }}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.primary,
              dayTextColor: theme.dark ? '#ffffff' : '#1c1b1f',
              textDisabledColor: theme.dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
              monthTextColor: theme.dark ? '#ffffff' : '#1c1b1f',
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.onPrimary,
              todayTextColor: theme.colors.error,
              arrowColor: theme.colors.primary,
              disabledArrowColor: theme.colors.outline,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
        </Card>

      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  resumeContainer: { marginTop: 16, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 6, marginBottom: 4 },
  formContainer: { marginTop: 16 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flexInput: { flex: 1 },
  fullInput: { marginBottom: 12 },
  dropdownField: { marginBottom: 14 },
  dropdownLabel: { marginBottom: 6, fontWeight: '600' },
  dropdownButton: { borderRadius: 8 },
  dropdownButtonContent: { justifyContent: 'flex-start', height: 48 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  saveBtn: { borderRadius: 20, paddingHorizontal: 16 },
  sectionTitle: { fontWeight: '700', marginLeft: 4, marginBottom: 10, marginTop: 10 },
  calendarCard: { borderRadius: 16, overflow: 'hidden', padding: 4 },
});
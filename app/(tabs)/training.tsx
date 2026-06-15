import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrainingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
        <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Entrenamiento" titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }} />
        </Appbar.Header>
      </View>
      <View>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
          Aqui puedes añadir tu rutina diaria.
        </Text>
        <Button
          onPress={() => { router.navigate("/workout") }}
          mode="contained"
        >
          Agregar Ejercicio
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    marginBottom: 0,

  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    marginTop: 40
  },
  field: {
    marginBottom: 16,
  },
  menuLabel: {
    marginBottom: 8,
  },
  menuButtonContent: {
    justifyContent: 'flex-start',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 28,
    paddingVertical: 4,
  },
});

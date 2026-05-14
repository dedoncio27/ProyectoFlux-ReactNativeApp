import { StyleSheet, Text, View } from 'react-native';

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrenamiento</Text>
      <Text style={styles.subtitle}>Aqui puedes anadir tu rutina diaria.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
});

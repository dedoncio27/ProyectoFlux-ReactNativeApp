import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

export default function ModalScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]} elevation={0}>
      <Text variant="headlineSmall" style={styles.title}>
        This is a modal
      </Text>
      <Link href="/" dismissTo asChild>
        <Button mode="text">Go to home screen</Button>
      </Link>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
});

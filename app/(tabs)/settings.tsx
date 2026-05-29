import CustomRowButton from '@/components/custom-row-button';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();


    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.Content title="Ajustes" titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }} />
                </Appbar.Header>
            </View>

            <View style={styles.content}>
                <Text style={styles.textStyle}>General</Text>
                <CustomRowButton
                    title="Temas"
                    description="Cambia el tema de la aplicación"
                    icon="palette"
                    onPress={() => router.navigate('/temas')}
                />
                <CustomRowButton
                    title="Ajustes Calorias"
                    description="Ajusta tus calorias diarias"
                    icon="fire"
                    onPress={() => { router.navigate('/calorySettings') }}
                />
                <CustomRowButton
                    title="Ajustes de Entrenamiento"
                    description="Ajusta tus entrenamientos diarios"
                    icon="weight-lifter"
                    onPress={() => { }}
                />
                <CustomRowButton
                    title="Ejercicios"
                    description="Visualiza todos los ejercicios disponibles"
                    icon="bike"
                    onPress={() => { }}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.textStyle}>Seguridad y Privacidad</Text>
                <CustomRowButton
                    title="Mi Perfil"
                    description="Información de mi cuenta"
                    icon="account"
                    onPress={() => { router.navigate('/myProfile') }}
                />
                <CustomRowButton
                    title="Contacto"
                    description="Contacta con el soporte técnico"
                    icon="email"
                    onPress={() => { }}
                />
                <CustomRowButton
                    title="Hazte Premium"
                    description="Haz un donativo para apoyar al proyecto"
                    icon="star"
                    onPress={() => { }}
                />
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
        borderColor: '#000000',
        borderWidth: 1,
        paddingVertical: 4,
        alignItems: 'flex-start',
        color: '#000000',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    content: {
        marginTop: 5,
        padding: 0,
        borderRadius: 10,
        borderWidth: 0,
        borderColor: '#c2c2c2ff',
    },
    textStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 16,
    },
});

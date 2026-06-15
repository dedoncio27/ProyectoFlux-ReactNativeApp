import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, List, Surface, Switch, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export default function TemasScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { isDark, setThemeMode } = useAppTheme();

    const handleToggleDarkMode = (value: boolean) => {
        setThemeMode(value ? 'dark' : 'light');
    };

    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            {/* Topbar: Standard style with theme.colors.primary (always #1565c0) */}
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content 
                        title="Temas" 
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }} 
                    />
                </Appbar.Header>
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Apariencia</Text>
                
                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <List.Item
                        title="Modo Oscuro"
                        titleStyle={{ color: theme.colors.onSurface }}
                        description="Activa o desactiva el tema oscuro de la aplicación"
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        left={(props) => (
                            <List.Icon 
                                {...props} 
                                icon={isDark ? "weather-night" : "weather-sunny"} 
                                color={theme.colors.primary} 
                            />
                        )}
                        right={() => (
                            <Switch
                                value={isDark}
                                onValueChange={handleToggleDarkMode}
                                color={theme.colors.primary}
                            />
                        )}
                        style={styles.listItem}
                    />
                </Surface>
                
                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                        El modo oscuro reduce el brillo de la pantalla y el cansancio visual en entornos con poca luz. El color de la barra superior e inferior se mantendrá para conservar la identidad de la aplicación.
                    </Text>
                </View>
            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 8,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: 12,
    },
    infoBox: {
        marginTop: 20,
        paddingHorizontal: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
});

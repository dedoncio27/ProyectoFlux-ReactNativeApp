import { auth } from '@/config/firebase';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { ChevronRight, Lock, LogOut, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut(auth);
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    // Detectamos si el tema actual es oscuro para ajustar la opacidad de los fondos de los iconos
    const isDark = theme.dark;

    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title="Mi Perfil"
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>

            <View style={styles.content}>
                {/* 1. SECCIÓN CABECERA / AVATAR */}
                <View style={styles.headerContainer}>
                    <View style={[styles.avatarCircle, {
                        backgroundColor: isDark ? 'rgba(21, 101, 192, 0.15)' : 'rgba(21, 101, 192, 0.1)',
                        borderColor: isDark ? 'rgba(21, 101, 192, 0.4)' : 'rgba(21, 101, 192, 0.2)'
                    }]}>
                        <User size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{auth.currentUser?.displayName}</Text>
                    <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{auth.currentUser?.email}</Text>
                </View>

                {/* 2. BLOQUE: SEGURIDAD */}
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Seguridad de la cuenta</Text>
                <View style={[styles.cardGroup, { backgroundColor: theme.colors.elevation.level1 }]}>

                    {/* Cambiar Contraseña */}
                    <TouchableOpacity style={styles.cardItem} activeOpacity={0.7}>
                        <View style={styles.cardLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                <Lock size={20} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.cardTextTitle, { color: theme.colors.onSurface }]}>Cambiar Contraseña</Text>
                                <Text style={[styles.cardTextSub, { color: theme.colors.onSurfaceVariant }]}>Actualiza tus credenciales de acceso</Text>
                            </View>
                        </View>
                        <ChevronRight size={18} color={theme.colors.outline} />
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: theme.colors.surfaceVariant }]} />

                    {/* Estado de la Cuenta */}
                    <View style={styles.cardItemNonClickable}>
                        <View style={styles.cardLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <ShieldCheck size={20} color="#10b981" />
                            </View>
                            <View>
                                <Text style={[styles.cardTextTitle, { color: theme.colors.onSurface }]}>Estado de la cuenta</Text>
                                <Text style={[styles.cardTextSub, { color: theme.colors.onSurfaceVariant }]}>Cuenta verificada y segura</Text>
                            </View>
                        </View>
                    </View>

                </View>

                {/* 3. BLOQUE: GESTIÓN */}
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Gestión de cuenta</Text>

                <View style={[styles.cardGroup, { backgroundColor: theme.colors.elevation.level1 }]}>

                    {/* Cerrar Sesión */}
                    <TouchableOpacity style={styles.cardItem} activeOpacity={0.7} onPress={handleLogout}>
                        <View style={styles.cardLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <LogOut size={20} color="#ef4444" />
                            </View>
                            <View>
                                <Text style={[styles.cardTextTitle, { color: '#ef4444' }]}>Cerrar Sesión</Text>
                                <Text style={[styles.cardTextSub, { color: theme.colors.onSurfaceVariant }]}>Salir de tu cuenta en este dispositivo</Text>
                            </View>
                        </View>
                        <ChevronRight size={18} color={theme.colors.outline} />
                    </TouchableOpacity>

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
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 28,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    cardGroup: {
        borderRadius: 14,
        marginBottom: 24,
        overflow: 'hidden',
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    cardItemNonClickable: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardTextTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardTextSub: {
        fontSize: 12,
        marginTop: 2,
    },
    separator: {
        height: 1,
        marginLeft: 66,
    },
});
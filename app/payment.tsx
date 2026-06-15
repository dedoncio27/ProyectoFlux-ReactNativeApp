import PlanNeonCard from '@/components/PlanNeonCard';
import { useAppTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Snackbar, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

// Tus Price IDs de Stripe
const PRICE_IDS = {
    cafe: 'price_1TiWZfBcwT4Z0dqSJeq1GhoK',      // 3€ - Pequeño donativo
    pizza: 'price_1TiWaCBcwT4Z0dqSaC56yeSm',     // 10€ - Donativo top
    sponsor: 'price_1TiWavBcwT4Z0dqS8ADkrQ5v',   // 25€ - Donativo épico
};

const API_URL = 'https://flux-backend-e9flgx4cc-adrians-projects-3ead0681.vercel.app';

export default function PaymentScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { isDark } = useAppTheme();

    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDonate = async (planId: string) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setError('Debes iniciar sesión para donar');
            return;
        }

        setLoading(planId);

        try {
            const url = `${API_URL}/api/payments/checkout`;
            const body = JSON.stringify({
                priceId: PRICE_IDS[planId as keyof typeof PRICE_IDS],
                userId: user.uid,
                userEmail: user.email,
            });

            console.log('📤 URL:', url);
            console.log('📤 Body:', body);

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            });

            const responseText = await res.text();
            console.log('📥 Status:', res.status);
            console.log('📥 Response:', responseText);

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            console.log('✅ Checkout URL:', data.url);

            await WebBrowser.openBrowserAsync(data.url);

        } catch (err: any) {
            console.error('❌ Error completo:', err);
            setError(err.message || 'Error al procesar el pago');
        } finally {
            setLoading(null);
        }
    };

    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            {/* Topbar */}
            <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title="Hazte Premium"
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                    Haz tu donación
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    style={styles.scrollViewStyle}
                >
                    <View style={{ width: CARD_WIDTH }}>
                        <PlanNeonCard
                            title="Pequeño donativo"
                            price="1€"
                            features={["Apoyas a los desarrolladores", "Mantienes la app viva"]}
                            borderColor="#0051ffff"
                            onPress={() => handleDonate('cafe')}
                            disabled={loading !== null}
                            loading={loading === 'cafe'}
                        />
                    </View>

                    <View style={{ width: CARD_WIDTH }}>
                        <PlanNeonCard
                            title="Donativo top"
                            price="10€"
                            features={["Apoyas a los desarrolladores", "Acceso a futuras funciones"]}
                            borderColor="#fa0909ff"
                            onPress={() => handleDonate('pizza')}
                            disabled={loading !== null}
                            loading={loading === 'pizza'}
                        />
                    </View>

                    <View style={{ width: CARD_WIDTH }}>
                        <PlanNeonCard
                            title="Donativo épico"
                            price="50€"
                            features={["Apoyas a los desarrolladores", "Mención especial en la app"]}
                            borderColor="#26a71aff"
                            onPress={() => handleDonate('sponsor')}
                            disabled={loading !== null}
                            loading={loading === 'sponsor'}
                        />
                    </View>
                </ScrollView>
            </View>

            <Text style={[styles.legalText, { color: theme.colors.onSurfaceVariant }]}>
                Al realizar una donación, aceptas nuestros términos y condiciones y que el dinero será destinado a mejorar la experiencia de los usuarios y a mantener la aplicación en funcionamiento.
            </Text>

            {/* Snackbar para errores */}
            <Snackbar
                visible={!!error}
                onDismiss={() => setError(null)}
                duration={3000}
                action={{ label: 'OK', onPress: () => setError(null) }}
            >
                {error}
            </Snackbar>
        </Surface>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        paddingTop: 16,
        flexDirection: 'column',
        width: '100%',
        marginTop: 40
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 24,
    },
    scrollViewStyle: {
        width: '100%',
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    legalText: {
        fontSize: 12,
        textAlign: 'center',
        marginHorizontal: 24,
        marginTop: 20,
    },
});
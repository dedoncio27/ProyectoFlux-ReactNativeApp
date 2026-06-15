import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

interface PlanNeonCardProps {
    title: string;          // Ej: "Plan Beast Mode"
    price: string;          // Ej: "9.99€ / mes"
    features: string[];     // Ej: ["Acceso ilimitado", "Gráficos avanzados"]
    borderColor: string;    // El color neón (Ej: '#00ffcc', '#ff007f', '#39ff14')
    buttonText?: string;    // Opcional: Texto del botón
    onPress: () => void;    // Acción al pulsar el botón de compra
    disabled?: boolean;
    loading?: boolean;
}

export default function PlanNeonCard({
    title,
    price,
    features,
    borderColor,
    buttonText = "Suscribirme",
    onPress,
}: PlanNeonCardProps) {
    const theme = useTheme();

    return (
        <Card
            style={[
                styles.card,
                {
                    backgroundColor: theme.dark ? '#1e1e24' : '#ffffff', // Fondo oscuro/claro adaptado
                    borderColor: borderColor,
                    // Aplicamos el brillo neón en las sombras
                    shadowColor: borderColor,
                    elevation: 8, // Brillo potente en Android
                },
            ]}
        >
            <Card.Content style={styles.content}>
                {/* Título del Plan */}
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                    {title}
                </Text>

                {/* Contenedor del Precio */}
                <View style={styles.priceContainer}>
                    <Text variant="displaySmall" style={[styles.price, { color: borderColor }]}>
                        {price}
                    </Text>
                </View>

                {/* Divisor difuminado con el color neón */}
                <View style={[styles.divider, { backgroundColor: borderColor, opacity: 0.3 }]} />

                {/* Lista de características */}
                <View style={styles.featuresList}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <Text style={[styles.featureCheck, { color: borderColor }]}>✓</Text>
                            <Text variant="bodyMedium" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                                {feature}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Botón de Pago Neón */}
                <Button
                    mode="contained"
                    onPress={onPress}
                    style={[styles.button, { backgroundColor: borderColor }]}
                    // Si el neón es muy claro, forzamos texto negro para que se lea perfectamente
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                >
                    {buttonText}
                </Button>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        borderWidth: 2, // Grosor del borde neón
        marginVertical: 12,
        marginHorizontal: 16,
        overflow: 'visible', // Permite que la sombra brille hacia fuera en iOS
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 12, // Difuminado del neón en iOS
            },
        }),
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 8,
    },
    priceContainer: {
        marginVertical: 12,
    },
    price: {
        fontWeight: '900',
        textAlign: 'center',
        // Pequeño truco de texto brillante para iOS
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 6,
                shadowOpacity: 0.5,
            },
        }),
    },
    divider: {
        height: 2,
        width: '80%',
        borderRadius: 1,
        marginVertical: 16,
    },
    featuresList: {
        width: '100%',
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    featureCheck: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 12,
    },
    featureText: {
        fontWeight: '500',
    },
    button: {
        width: '100%',
        borderRadius: 16,
        // Sombra para que el botón también tenga su propio aura neón
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 6,
                shadowOpacity: 0.4,
            },
        }),
    },
    buttonContent: {
        height: 48,
    },
    buttonLabel: {
        color: '#000000', // Texto oscuro sobre fondo neón brillante para máxima legibilidad
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase',
    },
});
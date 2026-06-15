import { Exercise, getExercises } from "@/lib/api";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Appbar, Icon, Searchbar, Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

const MUSCLE_GROUPS = [
    { name: "Todos", icon: "all-inclusive" }, // O "database", "dumbbell"
    { name: "Pectoral", icon: "human-male-board" },
    { name: "Espalda", icon: "human-handsup" },
    { name: "Hombros", icon: "human-male-height" },
    { name: "Bíceps", icon: "arm-flex" },
    { name: "Tríceps", icon: "arm-flex-outline" },
    { name: "Piernas", icon: "run" }, // O "walk"
    { name: "Abdominales", icon: "human-female-dance" },
    { name: "Glúteos", icon: "human-female" },
    { name: "Cardio", icon: "heart-pulse" },
];

export default function ExercisesScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filtered, setFiltered] = useState<Exercise[]>([]);
    const [selectedMuscle, setSelectedMuscle] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        try {
            const data = await getExercises();
            setExercises(data);
            setFiltered(data);
        } catch (error) {
            console.error("Error cargando ejercicios:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar cuando cambia grupo muscular o búsqueda
    useEffect(() => {
        let result = exercises;

        if (selectedMuscle !== "Todos") {
            result = result.filter((e) => e.muscle_group === selectedMuscle);
        }

        if (searchQuery.trim()) {
            result = result.filter((e) =>
                e.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFiltered(result);
    }, [selectedMuscle, searchQuery, exercises]);

    const renderMuscleFilter = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
        >
            {MUSCLE_GROUPS.map((item) => (
                <TouchableOpacity
                    key={item.name}
                    style={[
                        styles.muscleButton,
                        selectedMuscle === item.name && {
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.primary
                        },
                    ]}
                    onPress={() => setSelectedMuscle(item.name)}
                >
                    <Icon source={item.icon} size={20} color={theme.colors.primary} />
                    <Text
                        style={[
                            styles.muscleText,
                            selectedMuscle === item.name && { color: theme.colors.onPrimary },
                        ]}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderExerciseCard = ({ item }: { item: Exercise }) => (
        <TouchableOpacity style={styles.card}>
            <Image
                source={{ uri: item.image_url || 'PLACEHOLDER_IMAGE' }}
                style={styles.image}
                resizeMode="cover"
            //defaultSource={require('@/assets/images/placeholder-exercise.png')} // opcional
            />
            <View style={[styles.cardContent, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.exerciseName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={[styles.muscleGroup, { color: theme.colors.primary }]}>
                    {item.muscle_group}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
                <View style={{ backgroundColor: theme.colors.primary, paddingTop: insets.top }}>
                    <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                        <Appbar.Content
                            title="Ejercicios"
                            titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                        />
                    </Appbar.Header>
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </Surface>
        );
    }

    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content
                        title="Ejercicios"
                        titleStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 18 }}
                    />
                </Appbar.Header>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <Searchbar
                    placeholder="Buscar ejercicio..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    icon="magnify"
                    clearIcon="close"
                />
                {renderMuscleFilter()}
            </View>
            <Text style={styles.resultsText}>
                {filtered.length} ejercicios encontrados
            </Text>

            <FlatList
                data={filtered}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderExerciseCard}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No hay ejercicios</Text>
                    </View>
                }
            />
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
    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        borderRadius: 12,
        elevation: 2,
    },
    filterContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxHeight: 100,
        marginBottom: 0,
    },
    muscleButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 1,
        marginHorizontal: 4,
        borderRadius: 16,
        backgroundColor: "white",
        minWidth: 70,
        maxHeight: 70,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    muscleIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    muscleText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    resultsText: {
        fontSize: 14,
        color: "#666",
        marginHorizontal: 16,
        marginBottom: 8,
        fontWeight: "500",
    },
    grid: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100,
    },
    card: {
        width: ITEM_WIDTH,
        backgroundColor: "white",
        borderRadius: 16,
        margin: 8,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: {
        width: "100%",
        height: 120,
        backgroundColor: "#e0e0e0",
    },
    cardContent: {
        padding: 12,
    },
    exerciseName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
        lineHeight: 18,
    },
    muscleGroup: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
    },
});
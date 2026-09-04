import { auth } from "@/config/firebase";
import {
    addExerciseToWorkout,
    AddExerciseToWorkoutInput,
    createWorkout,
    Exercise,
    getExercises,
    getWorkouts,
    Workout,
} from "@/lib/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    Appbar,
    Avatar,
    Button,
    Chip,
    Divider,
    FAB,
    IconButton,
    List,
    Modal,
    Portal,
    Surface,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const MUSCLE_GROUPS = [
    { name: "Todos", icon: "🏋️" },
    { name: "Pectoral", icon: "💪" },
    { name: "Espalda", icon: "🔙" },
    { name: "Hombros", icon: "🦾" },
    { name: "Bíceps", icon: "💪" },
    { name: "Tríceps", icon: "🦾" },
    { name: "Piernas", icon: "🦵" },
    { name: "Abdominales", icon: "🎯" },
    { name: "Glúteos", icon: "🍑" },
    { name: "Cardio", icon: "❤️" },
];

interface SelectedExercise extends AddExerciseToWorkoutInput {
    exercise_name: string;
    exercise_image: string;
    muscle_group: string;
}

export default function WorkoutsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // --- Estados ---
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>(auth.currentUser?.email || "usuario@email.com");

    // Suscripción al estado de autenticación para obtener el email dinámicamente
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUserId(user?.email || "usuario@email.com");
        });
        return () => unsubscribe();
    }, []);

    // Modal crear entrenamiento
    const [modalVisible, setModalVisible] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [workoutName, setWorkoutName] = useState("");

    // Selección de ejercicios
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMuscle, setSelectedMuscle] = useState("Todos");
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [saving, setSaving] = useState(false);

    // --- Carga inicial (se recarga al cambiar userId) ---
    useEffect(() => {
        loadWorkouts();
    }, [userId]);

    const loadWorkouts = async () => {
        try {
            setLoading(true);
            const data = await getWorkouts(userId);
            setWorkouts(data);
        } catch (error) {
            console.error("Error cargando entrenamientos:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Carga de ejercicios para el modal ---
    useEffect(() => {
        if (modalVisible && step === 2) {
            loadExercisesList();
        }
    }, [modalVisible, step]);

    const loadExercisesList = async () => {
        try {
            const data = await getExercises();
            setExercises(data);
            setFilteredExercises(data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- Filtros de ejercicios ---
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
        setFilteredExercises(result);
    }, [selectedMuscle, searchQuery, exercises]);

    // --- Añadir/Quitar ejercicios ---
    const addExercise = (exercise: Exercise) => {
        const exists = selectedExercises.find((se) => se.exercise_id === exercise.id);
        if (exists) return;

        const newItem: SelectedExercise = {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            exercise_image: exercise.image_url,
            muscle_group: exercise.muscle_group,
            sets: 3,
            reps: 10,
            weight: 0,
            rest_seconds: 60,
            order_index: selectedExercises.length,
            notes: "",
        };
        setSelectedExercises([...selectedExercises, newItem]);
    };

    const removeExercise = (exerciseId: string) => {
        setSelectedExercises((prev) =>
            prev
                .filter((se) => se.exercise_id !== exerciseId)
                .map((se, idx) => ({ ...se, order_index: idx }))
        );
    };

    const updateExerciseField = (
        exerciseId: string,
        field: keyof SelectedExercise,
        value: any
    ) => {
        setSelectedExercises((prev) =>
            prev.map((se) => (se.exercise_id === exerciseId ? { ...se, [field]: value } : se))
        );
    };

    // --- Guardar entrenamiento ---
    const saveWorkout = async () => {
        if (!workoutName.trim() || selectedExercises.length === 0) return;

        try {
            setSaving(true);
            // 1. Crear el entrenamiento
            const workout = await createWorkout({ name: workoutName.trim(), user_id: userId });

            // 2. Añadir ejercicios
            const exercisesPayload = selectedExercises.map((se) => ({
                exercise_id: se.exercise_id,
                sets: se.sets,
                reps: se.reps,
                weight: se.weight,
                rest_seconds: se.rest_seconds,
                order_index: se.order_index,
                notes: se.notes || undefined,
            }));

            await addExerciseToWorkout(workout.id, exercisesPayload);

            // 3. Reset y cerrar
            setModalVisible(false);
            setStep(1);
            setWorkoutName("");
            setSelectedExercises([]);
            setSearchQuery("");
            setSelectedMuscle("Todos");
            loadWorkouts();
        } catch (error) {
            console.error("Error guardando entrenamiento:", error);
        } finally {
            setSaving(false);
        }
    };

    // --- Render ---
    const renderWorkoutCard = ({ item }: { item: Workout }) => (
        <Surface style={styles.workoutCard} elevation={2}>
            <View style={styles.workoutHeader}>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                    {item.name}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {item.exercises?.length || 0} ejercicios
                </Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.exercises?.map((ex) => (
                    <View key={ex.id} style={styles.miniExercise}>
                        <Avatar.Image
                            size={40}
                            source={{ uri: ex.exercise_image }}
                            style={{ backgroundColor: theme.colors.surfaceVariant }}
                        />
                        <Text variant="bodySmall" numberOfLines={1} style={{ maxWidth: 80, marginTop: 4 }}>
                            {ex.exercise_name}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </Surface>
    );

    const renderExerciseSelector = ({ item }: { item: Exercise }) => {
        const isSelected = selectedExercises.some((se) => se.exercise_id === item.id);
        return (
            <List.Item
                title={item.name}
                description={item.muscle_group}
                left={() => (
                    <Avatar.Image
                        size={48}
                        source={{ uri: item.image_url }}
                        style={{ backgroundColor: theme.colors.surfaceVariant }}
                    />
                )}
                right={() => (
                    <IconButton
                        icon={isSelected ? "check-circle" : "plus-circle"}
                        iconColor={isSelected ? theme.colors.primary : theme.colors.outline}
                        size={28}
                        onPress={() => !isSelected && addExercise(item)}
                        disabled={isSelected}
                    />
                )}
                style={[
                    styles.exerciseListItem,
                    isSelected && { backgroundColor: theme.colors.primaryContainer },
                ]}
            />
        );
    };

    return (
        <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
                <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
                    <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
                    <Appbar.Content title="Entrenamiento" titleStyle={{ color: theme.colors.onPrimary, fontWeight: "600", fontSize: 18 }} />
                </Appbar.Header>
            </View>

            {/* Lista de entrenamientos */}
            <FlatList
                data={workouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWorkoutCard}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                            No tienes entrenamientos creados
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                            Pulsa el botón + para crear uno
                        </Text>
                    </View>
                }
            />

            {/* FAB Crear */}
            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={() => {
                    setModalVisible(true);
                    setStep(1);
                    setWorkoutName("");
                    setSelectedExercises([]);
                }}
            />

            {/* Modal Crear Entrenamiento */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
                            <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                                {step === 1 ? "Nuevo Entrenamiento" : "Añadir Ejercicios"}
                            </Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <Divider />

                        {/* Paso 1: Nombre */}
                        {step === 1 && (
                            <View style={styles.stepContainer}>
                                <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.outline }}>
                                    Dale un nombre a tu rutina de entrenamiento
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    label="Nombre del entrenamiento"
                                    value={workoutName}
                                    onChangeText={setWorkoutName}
                                    placeholder="Ej: Push Day - Pecho y Hombros"
                                    style={{ backgroundColor: theme.colors.background }}
                                />
                                <Button
                                    mode="contained"
                                    onPress={() => workoutName.trim().length > 1 && setStep(2)}
                                    disabled={workoutName.trim().length < 2}
                                    style={{ marginTop: 24 }}
                                >
                                    Siguiente
                                </Button>
                            </View>
                        )}

                        {/* Paso 2: Seleccionar ejercicios */}
                        {step === 2 && (
                            <View style={{ flex: 1 }}>
                                {/* Search & Filter */}
                                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Buscar ejercicio..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        left={<TextInput.Icon icon="magnify" />}
                                        right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery("")} /> : null}
                                        style={{ backgroundColor: theme.colors.background, height: 48 }}
                                    />
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
                                >
                                    {MUSCLE_GROUPS.map((mg) => (
                                        <Chip
                                            key={mg.name}
                                            selected={selectedMuscle === mg.name}
                                            onPress={() => setSelectedMuscle(mg.name)}
                                            style={{ marginHorizontal: 4 }}
                                            selectedColor={theme.colors.primary}
                                        >
                                            {mg.icon} {mg.name}
                                        </Chip>
                                    ))}
                                </ScrollView>

                                <Text variant="bodySmall" style={{ paddingHorizontal: 16, color: theme.colors.outline }}>
                                    {filteredExercises.length} ejercicios disponibles · {selectedExercises.length} seleccionados
                                </Text>

                                {/* Lista de ejercicios disponibles */}
                                <FlatList
                                    data={filteredExercises}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderExerciseSelector}
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ paddingHorizontal: 8 }}
                                />

                                {/* Panel de ejercicios seleccionados */}
                                {selectedExercises.length > 0 && (
                                    <Surface style={[styles.selectedPanel, { backgroundColor: theme.colors.surface }]} elevation={3}>
                                        <Text variant="titleSmall" style={{ fontWeight: "700", marginBottom: 8 }}>
                                            Ejercicios añadidos ({selectedExercises.length})
                                        </Text>
                                        <ScrollView style={{ maxHeight: 180 }}>
                                            {selectedExercises.map((se, idx) => (
                                                <View key={se.exercise_id} style={styles.selectedRow}>
                                                    <Text variant="bodyMedium" style={{ flex: 1 }}>
                                                        {idx + 1}. {se.exercise_name}
                                                    </Text>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                                        <TextInput
                                                            mode="flat"
                                                            dense
                                                            label="Sets"
                                                            value={se.sets?.toString()}
                                                            onChangeText={(v) => updateExerciseField(se.exercise_id, "sets", parseInt(v) || 0)}
                                                            keyboardType="numeric"
                                                            style={{ width: 55, height: 40 }}
                                                        />
                                                        <TextInput
                                                            mode="flat"
                                                            dense
                                                            label="Reps"
                                                            value={se.reps?.toString()}
                                                            onChangeText={(v) => updateExerciseField(se.exercise_id, "reps", parseInt(v) || 0)}
                                                            keyboardType="numeric"
                                                            style={{ width: 55, height: 40 }}
                                                        />
                                                        <TextInput
                                                            mode="flat"
                                                            dense
                                                            label="Kg"
                                                            value={se.weight?.toString()}
                                                            onChangeText={(v) => updateExerciseField(se.exercise_id, "weight", parseFloat(v) || 0)}
                                                            keyboardType="numeric"
                                                            style={{ width: 60, height: 40 }}
                                                        />
                                                        <IconButton
                                                            icon="delete"
                                                            size={20}
                                                            iconColor={theme.colors.error}
                                                            onPress={() => removeExercise(se.exercise_id)}
                                                        />
                                                    </View>
                                                </View>
                                            ))}
                                        </ScrollView>
                                        <Button
                                            mode="contained"
                                            onPress={saveWorkout}
                                            loading={saving}
                                            disabled={saving}
                                            style={{ marginTop: 12 }}
                                        >
                                            Guardar Entrenamiento
                                        </Button>
                                    </Surface>
                                )}
                            </View>
                        )}
                    </KeyboardAvoidingView>
                </Modal>
            </Portal>
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
    workoutCard: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
    },
    workoutHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    miniExercise: {
        alignItems: "center",
        marginRight: 12,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        borderRadius: 28,
    },
    modalContainer: {
        flex: 1,
        margin: 0,
        marginTop: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    stepContainer: {
        padding: 24,
    },
    exerciseListItem: {
        borderRadius: 12,
        marginVertical: 2,
    },
    selectedPanel: {
        padding: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.45,
    },
    selectedRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
});
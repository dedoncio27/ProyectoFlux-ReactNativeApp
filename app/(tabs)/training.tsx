import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput as RNTextInput,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Appbar,
  Surface,
  Text,
  useTheme,
  Button,
  Portal,
  Modal,
  IconButton,
  Avatar,
  Divider,
  Chip,
  ActivityIndicator,
  Searchbar,
  Card,
  Snackbar,
  List,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '@/config/firebase';
import * as Haptics from 'expo-haptics';
import {
  Play,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Dumbbell,
  Timer,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react-native';

import {
  getWorkouts,
  Workout,
  WorkoutExercise,
  Exercise,
  getExercises,
  updateWorkoutExercises,
  updateWorkout,
  deleteWorkout,
  AddExerciseToWorkoutInput,
} from '@/lib/api';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function TrainingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Estados ---
  const [userEmail, setUserEmail] = useState<string>(auth.currentUser?.email || "usuario@email.com");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Suscripción al estado de autenticación para obtener el email dinámicamente
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || "usuario@email.com");
    });
    return () => unsubscribe();
  }, []);

  // --- Modal Iniciar Entrenamiento ---
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  // Rastreo de series completadas: { [exercise_id-set_index]: boolean }
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean }>({});
  
  // Timer de descanso
  const [timerVisible, setTimerVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerMax, setTimerMax] = useState(60);

  // --- Modal Editar Entrenamiento ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedExercises, setEditedExercises] = useState<WorkoutExercise[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // --- Sub-Modal Añadir Ejercicios (dentro de Editar) ---
  const [addExercisesModalVisible, setAddExercisesModalVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

  const MUSCLE_GROUPS = [
    'Todos',
    'Pectoral',
    'Espalda',
    'Hombros',
    'Bíceps',
    'Tríceps',
    'Piernas',
    'Abdominales',
    'Glúteos',
    'Cardio',
  ];

  // --- Cargar Entrenamientos ---
  const loadWorkouts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getWorkouts(userEmail);
      setWorkouts(data);
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
      showToast('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [userEmail])
  );

  // --- Cargar Todos los Ejercicios ---
  const loadAllExercises = async () => {
    try {
      const data = await getExercises();
      setAllExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Error cargando ejercicios disponibles:', error);
    }
  };

  useEffect(() => {
    if (addExercisesModalVisible) {
      loadAllExercises();
    }
  }, [addExercisesModalVisible]);

  // Filtrar ejercicios
  useEffect(() => {
    let result = allExercises;
    if (selectedMuscle !== 'Todos') {
      result = result.filter((e) => e.muscle_group === selectedMuscle);
    }
    if (searchQuery.trim()) {
      result = result.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredExercises(result);
  }, [selectedMuscle, searchQuery, allExercises]);

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // --- Timer logic ---
  useEffect(() => {
    let interval: any;
    if (timerVisible && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerVisible) {
      setTimerVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('¡Tiempo de descanso finalizado!', 'Es hora de tu siguiente serie.');
    }
    return () => clearInterval(interval);
  }, [timerVisible, timeLeft]);

  const startRestTimer = (seconds: number) => {
    setTimerMax(seconds);
    setTimeLeft(seconds);
    setTimerVisible(true);
  };

  // --- Iniciar Entrenamiento ---
  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    // Clonar ejercicios con sus datos
    setActiveExercises([...workout.exercises]);
    setCompletedSets({});
    setStartModalVisible(true);
  };

  const handleToggleSet = (exerciseId: string, setIndex: number, restSeconds: number) => {
    const key = `${exerciseId}-${setIndex}`;
    const isNowCompleted = !completedSets[key];
    
    setCompletedSets((prev) => ({
      ...prev,
      [key]: isNowCompleted,
    }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Si se completó la serie, activar timer de descanso
    if (isNowCompleted && restSeconds > 0) {
      startRestTimer(restSeconds);
    }
  };

  const handleUpdateActiveField = (exerciseId: string, field: 'weight' | 'reps', value: number) => {
    setActiveExercises((prev) =>
      prev.map((ex) =>
        ex.exercise_id === exerciseId
          ? { ...ex, [field]: Math.max(0, value) }
          : ex
      )
    );
  };

  const handleFinishWorkout = async () => {
    if (!selectedWorkout) return;

    try {
      setLoading(true);
      // Guardar los kilos y repes ajustados de vuelta en la rutina plantilla
      const payload: AddExerciseToWorkoutInput[] = activeExercises.map((ex, idx) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: ex.rest_seconds,
        order_index: idx,
        notes: ex.notes || undefined,
      }));

      await updateWorkoutExercises(selectedWorkout.id, payload);
      
      setStartModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '¡Entrenamiento Completado! 🎉',
        'Buen trabajo. Los pesos y repeticiones se han guardado como tu nuevo objetivo.',
        [{ text: 'Genial', onPress: () => loadWorkouts(true) }]
      );
    } catch (error) {
      console.error('Error al finalizar entrenamiento:', error);
      showToast('Error al guardar el entrenamiento');
      setLoading(false);
    }
  };

  // --- Editar Entrenamiento ---
  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setEditedName(workout.name);
    setEditedExercises([...workout.exercises]);
    setEditModalVisible(true);
  };

  const handleRemoveExerciseFromEdit = (exerciseId: string) => {
    setEditedExercises((prev) => prev.filter((e) => e.exercise_id !== exerciseId));
  };

  const handleUpdateEditField = (exerciseId: string, field: keyof WorkoutExercise, value: any) => {
    setEditedExercises((prev) =>
      prev.map((ex) =>
        ex.exercise_id === exerciseId
          ? { ...ex, [field]: value }
          : ex
      )
    );
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editedExercises.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...editedExercises];
    const temp = newList[index];
    newList[index] = newList[newIndex];
    newList[newIndex] = temp;

    // Actualizar order_index
    const updatedList = newList.map((item, idx) => ({
      ...item,
      order_index: idx,
    }));

    setEditedExercises(updatedList);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    // Comprobar si ya existe
    const exists = editedExercises.find((e) => e.exercise_id === exercise.id);
    if (exists) {
      showToast('Este ejercicio ya está en la rutina');
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now(), // ID temporal
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      exercise_image: exercise.image_url,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: 10,
      weight: 0,
      rest_seconds: 60,
      order_index: editedExercises.length,
      notes: '',
    };

    setEditedExercises((prev) => [...prev, newWorkoutExercise]);
    showToast(`Añadido: ${exercise.name}`);
  };

  const handleSaveEdit = async () => {
    if (!selectedWorkout) return;
    if (!editedName.trim()) {
      showToast('El nombre no puede estar vacío');
      return;
    }

    try {
      setIsSavingEdit(true);
      // 1. Actualizar el nombre si cambió
      if (editedName.trim() !== selectedWorkout.name) {
        await updateWorkout(selectedWorkout.id, { name: editedName.trim() });
      }

      // 2. Actualizar la lista de ejercicios
      const payload: AddExerciseToWorkoutInput[] = editedExercises.map((ex, idx) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: ex.rest_seconds,
        order_index: idx,
        notes: ex.notes || undefined,
      }));

      await updateWorkoutExercises(selectedWorkout.id, payload);

      setEditModalVisible(false);
      showToast('Rutina actualizada correctamente');
      loadWorkouts(true);
    } catch (error) {
      console.error('Error al editar rutina:', error);
      showToast('Error al guardar cambios');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    Alert.alert(
      'Eliminar rutina',
      `¿Estás seguro de que quieres eliminar la rutina "${selectedWorkout.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteWorkout(selectedWorkout.id);
              setEditModalVisible(false);
              showToast('Rutina eliminada');
              loadWorkouts(true);
            } catch (error) {
              console.error('Error al eliminar rutina:', error);
              showToast('Error al eliminar la rutina');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // --- Renderizado de tarjetas de rutinas ---
  const renderWorkoutCard = (workout: Workout) => {
    const totalExercises = workout.exercises?.length || 0;
    
    return (
      <Card
        key={workout.id}
        style={[styles.workoutCard, { backgroundColor: theme.colors.elevation.level2 }]}
        mode="elevated"
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Dumbbell size={24} color={theme.colors.primary} />
            <Chip style={styles.chip} textStyle={{ fontSize: 11, fontWeight: 'bold' }}>
              {totalExercises} ej.
            </Chip>
          </View>
          
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {workout.name}
          </Text>

          <Divider style={{ marginVertical: 8 }} />

          <Text style={[styles.previewTitle, { color: theme.colors.outline }]}>Ejercicios:</Text>
          <View style={styles.previewContainer}>
            {totalExercises === 0 ? (
              <Text style={{ fontSize: 13, color: theme.colors.outline, fontStyle: 'italic' }}>
                Sin ejercicios añadidos
              </Text>
            ) : (
              workout.exercises.slice(0, 3).map((ex, idx) => (
                <View key={ex.id || idx} style={styles.previewItem}>
                  <Avatar.Image
                    size={24}
                    source={{ uri: ex.exercise_image || 'PLACEHOLDER_IMAGE' }}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                  />
                  <Text style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    {ex.exercise_name}
                  </Text>
                </View>
              ))
            )}
            {totalExercises > 3 && (
              <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 4, fontWeight: '500' }}>
                + {totalExercises - 3} más
              </Text>
            )}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            style={styles.cardBtn}
            contentStyle={{ height: 38 }}
            labelStyle={{ fontSize: 13 }}
            onPress={() => handleEditWorkout(workout)}
            icon={() => <Edit size={14} color={theme.colors.primary} />}
          >
            Editar
          </Button>
          <Button
            mode="contained"
            style={[styles.cardBtn, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ height: 38 }}
            labelStyle={{ fontSize: 13, color: theme.colors.onPrimary }}
            onPress={() => handleStartWorkout(workout)}
            icon={() => <Play size={14} color={theme.colors.onPrimary} />}
          >
            Empezar
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]} elevation={0}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top }]}>
        <Appbar.Header mode="center-aligned" statusBarHeight={0} style={{ height: 70, backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Mi Entrenamiento" titleStyle={{ color: theme.colors.onPrimary, fontWeight: '700', fontSize: 20 }} />
        </Appbar.Header>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Motivacional */}
        <Surface style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
          <View style={styles.bannerInfo}>
            <Text style={[styles.bannerTitle, { color: theme.colors.onPrimaryContainer }]}>
              ¡Mantén la constancia! 💪
            </Text>
            <Text style={[styles.bannerSub, { color: theme.colors.onPrimaryContainer }]}>
              Elige una rutina guardada para iniciar tu entrenamiento o crea una nueva rutina.
            </Text>
          </View>
        </Surface>

        {/* Sección de Rutinas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Mis Rutinas Guardadas</Text>
        </View>

        {loading && workouts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 12, color: theme.colors.outline }}>Cargando tus rutinas...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {workouts.map((workout) => renderWorkoutCard(workout))}

            {/* Tarjeta para añadir más rutinas */}
            <TouchableOpacity
              onPress={() => router.navigate('/workout')}
              style={[
                styles.addWorkoutCard,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.dark ? '#1a1d24' : '#f0f4ff',
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.addIconCircle, { backgroundColor: theme.colors.primary }]}>
                <Plus size={32} color={theme.colors.onPrimary} />
              </View>
              <Text style={[styles.addWorkoutTitle, { color: theme.colors.primary }]}>
                Nueva Rutina
              </Text>
              <Text style={[styles.addWorkoutSub, { color: theme.colors.outline }]}>
                Crea y personaliza una nueva rutina de ejercicios.
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Botón flotante alternativo / Acceso rápido */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Button
            mode="contained-tonal"
            style={styles.quickAddBtn}
            labelStyle={{ fontWeight: 'bold' }}
            onPress={() => router.navigate('/workout')}
            icon="plus"
          >
            Gestionar y Crear Rutinas
          </Button>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL INICIAR ENTRENAMIENTO                                               */}
      {/* ========================================================================= */}
      <Portal>
        <Modal
          visible={startModalVisible}
          onDismiss={() => {
            if (timerVisible) {
              Alert.alert(
                'Salir del entrenamiento',
                '¿Quieres detener el entrenamiento activo y salir?',
                [
                  { text: 'No, continuar', style: 'cancel' },
                  { text: 'Sí, salir', onPress: () => {
                    setStartModalVisible(false);
                    setTimerVisible(false);
                  }}
                ]
              );
            } else {
              setStartModalVisible(false);
            }
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <IconButton icon="close" size={24} onPress={() => setStartModalVisible(false)} />
            <Text style={[styles.modalHeaderTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
              Entrenando: {selectedWorkout?.name}
            </Text>
            <IconButton
              icon={() => <Timer size={22} color={timerVisible ? theme.colors.primary : theme.colors.outline} />}
              onPress={() => {
                if (timerVisible) {
                  setTimerVisible(false);
                } else {
                  startRestTimer(60);
                }
              }}
            />
          </View>

          {/* Banner del Timer de descanso activo */}
          {timerVisible && (
            <Surface style={[styles.timerBanner, { backgroundColor: theme.colors.primary }]} elevation={2}>
              <Timer size={18} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', flex: 1 }}>
                Descanso activo: {timeLeft}s / {timerMax}s
              </Text>
              <IconButton
                icon="close"
                size={16}
                iconColor={theme.colors.onPrimary}
                onPress={() => setTimerVisible(false)}
                style={{ margin: 0 }}
              />
            </Surface>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <FlatList
              data={activeExercises}
              keyExtractor={(item, index) => `${item.exercise_id}-${index}`}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => {
                // Generar array de series
                const setsArray = Array.from({ length: item.sets || 3 });
                return (
                  <Surface style={[styles.workoutSetCard, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
                    <View style={styles.workoutSetHeader}>
                      <Avatar.Image
                        size={40}
                        source={{ uri: item.exercise_image || 'PLACEHOLDER_IMAGE' }}
                        style={{ backgroundColor: theme.colors.surfaceVariant }}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.workoutSetName, { color: theme.colors.onSurface }]}>
                          {item.exercise_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' }}>
                          {item.muscle_group}
                        </Text>
                      </View>
                    </View>

                    <Divider style={{ marginVertical: 8 }} />

                    {/* Controles de Kilos y Repeticiones (objetivos para la rutina) */}
                    <View style={styles.exerciseParamsRow}>
                      <View style={styles.paramControl}>
                        <Text style={[styles.paramLabel, { color: theme.colors.outline }]}>Peso (Kg)</Text>
                        <View style={styles.stepperContainer}>
                          <IconButton
                            icon="minus"
                            size={16}
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateActiveField(item.exercise_id, 'weight', item.weight - 2.5)}
                          />
                          <RNTextInput
                            keyboardType="numeric"
                            value={item.weight.toString()}
                            onChangeText={(text) => handleUpdateActiveField(item.exercise_id, 'weight', parseFloat(text) || 0)}
                            style={[styles.stepperInput, { color: theme.colors.onSurface }]}
                          />
                          <IconButton
                            icon="plus"
                            size={16}
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateActiveField(item.exercise_id, 'weight', item.weight + 2.5)}
                          />
                        </View>
                      </View>

                      <View style={styles.paramControl}>
                        <Text style={[styles.paramLabel, { color: theme.colors.outline }]}>Repeticiones</Text>
                        <View style={styles.stepperContainer}>
                          <IconButton
                            icon="minus"
                            size={16}
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateActiveField(item.exercise_id, 'reps', item.reps - 1)}
                          />
                          <RNTextInput
                            keyboardType="numeric"
                            value={item.reps.toString()}
                            onChangeText={(text) => handleUpdateActiveField(item.exercise_id, 'reps', parseInt(text) || 0)}
                            style={[styles.stepperInput, { color: theme.colors.onSurface }]}
                          />
                          <IconButton
                            icon="plus"
                            size={16}
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateActiveField(item.exercise_id, 'reps', item.reps + 1)}
                          />
                        </View>
                      </View>
                    </View>

                    <Divider style={{ marginVertical: 8 }} />

                    {/* Fila de Series checklist */}
                    <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 6, color: theme.colors.onSurfaceVariant }}>
                      Control de Series ({item.sets} series):
                    </Text>
                    <View style={styles.setsList}>
                      {setsArray.map((_, sIdx) => {
                        const key = `${item.exercise_id}-${sIdx}`;
                        const isDone = !!completedSets[key];
                        return (
                          <TouchableOpacity
                            key={sIdx}
                            onPress={() => handleToggleSet(item.exercise_id, sIdx, item.rest_seconds || 60)}
                            style={[
                              styles.setCheckCircle,
                              {
                                backgroundColor: isDone ? '#4caf50' : theme.colors.surfaceVariant,
                                borderColor: isDone ? '#4caf50' : theme.colors.outline,
                              },
                            ]}
                          >
                            <Text style={{ color: isDone ? '#ffffff' : theme.colors.onSurfaceVariant, fontSize: 12, fontWeight: 'bold' }}>
                              {isDone ? '✓' : sIdx + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {item.rest_seconds > 0 && (
                      <Text style={{ fontSize: 11, color: theme.colors.outline, marginTop: 4 }}>
                        Descanso recomendado: {item.rest_seconds} seg.
                      </Text>
                    )}
                  </Surface>
                );
              }}
            />
          </KeyboardAvoidingView>

          {/* Botón flotante para guardar entrenamiento */}
          <Surface style={[styles.modalFooter, { backgroundColor: theme.colors.elevation.level1 }]} elevation={3}>
            <Button
              mode="contained"
              style={[styles.finishBtn, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
              onPress={handleFinishWorkout}
            >
              Finalizar Entrenamiento
            </Button>
          </Surface>
        </Modal>
      </Portal>

      {/* ========================================================================= */}
      {/* MODAL EDITAR ENTRENAMIENTO                                                */}
      {/* ========================================================================= */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <IconButton icon="close" size={24} onPress={() => setEditModalVisible(false)} />
            <Text style={[styles.modalHeaderTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
              Editar Rutina
            </Text>
            <IconButton
              icon={() => <Trash2 size={20} color={theme.colors.error} />}
              onPress={handleDeleteWorkout}
            />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
              {/* Input nombre */}
              <RNTextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nombre del entrenamiento..."
                style={[
                  styles.editNameInput,
                  {
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
              />

              <Divider style={{ marginVertical: 16 }} />

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontSize: 16 }]}>
                  Ejercicios en la rutina ({editedExercises.length})
                </Text>
              </View>

              {editedExercises.length === 0 ? (
                <View style={styles.emptyExercisesEdit}>
                  <Info size={32} color={theme.colors.outline} />
                  <Text style={{ color: theme.colors.outline, marginTop: 8, textAlign: 'center' }}>
                    Esta rutina no tiene ejercicios. Pulsa "+ Añadir Ejercicio" abajo.
                  </Text>
                </View>
              ) : (
                editedExercises.map((item, index) => (
                  <Surface
                    key={`${item.exercise_id}-${index}`}
                    style={[styles.editExerciseCard, { backgroundColor: theme.colors.elevation.level1 }]}
                    elevation={1}
                  >
                    <View style={styles.editExerciseHeader}>
                      <Avatar.Image
                        size={32}
                        source={{ uri: item.exercise_image || 'PLACEHOLDER_IMAGE' }}
                        style={{ backgroundColor: theme.colors.surfaceVariant }}
                      />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.workoutSetName, { fontSize: 14, color: theme.colors.onSurface }]} numberOfLines={1}>
                          {item.exercise_name}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.colors.primary, fontWeight: 'bold' }}>
                          {item.muscle_group}
                        </Text>
                      </View>

                      {/* Ordenadores */}
                      <View style={styles.orderButtons}>
                        <IconButton
                          icon={() => <ChevronUp size={16} color={index === 0 ? theme.colors.outlineVariant : theme.colors.outline} />}
                          size={18}
                          style={{ margin: 0 }}
                          disabled={index === 0}
                          onPress={() => handleMoveExercise(index, 'up')}
                        />
                        <IconButton
                          icon={() => <ChevronDown size={16} color={index === editedExercises.length - 1 ? theme.colors.outlineVariant : theme.colors.outline} />}
                          size={18}
                          style={{ margin: 0 }}
                          disabled={index === editedExercises.length - 1}
                          onPress={() => handleMoveExercise(index, 'down')}
                        />
                      </View>

                      <IconButton
                        icon={() => <Trash2 size={16} color={theme.colors.error} />}
                        onPress={() => handleRemoveExerciseFromEdit(item.exercise_id)}
                        style={{ margin: 0 }}
                      />
                    </View>

                    <Divider style={{ marginVertical: 8 }} />

                    {/* Editar parámetros por defecto */}
                    <View style={styles.paramsGrid}>
                      <View style={styles.paramItemEdit}>
                        <Text style={styles.paramLabelEdit}>Series</Text>
                        <RNTextInput
                          keyboardType="numeric"
                          value={item.sets?.toString() || '3'}
                          onChangeText={(val) => handleUpdateEditField(item.exercise_id, 'sets', parseInt(val) || 0)}
                          style={[styles.paramInputEdit, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                        />
                      </View>

                      <View style={styles.paramItemEdit}>
                        <Text style={styles.paramLabelEdit}>Reps</Text>
                        <RNTextInput
                          keyboardType="numeric"
                          value={item.reps?.toString() || '10'}
                          onChangeText={(val) => handleUpdateEditField(item.exercise_id, 'reps', parseInt(val) || 0)}
                          style={[styles.paramInputEdit, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                        />
                      </View>

                      <View style={styles.paramItemEdit}>
                        <Text style={styles.paramLabelEdit}>Kg</Text>
                        <RNTextInput
                          keyboardType="numeric"
                          value={item.weight?.toString() || '0'}
                          onChangeText={(val) => handleUpdateEditField(item.exercise_id, 'weight', parseFloat(val) || 0)}
                          style={[styles.paramInputEdit, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                        />
                      </View>

                      <View style={styles.paramItemEdit}>
                        <Text style={styles.paramLabelEdit}>Desc. (s)</Text>
                        <RNTextInput
                          keyboardType="numeric"
                          value={item.rest_seconds?.toString() || '60'}
                          onChangeText={(val) => handleUpdateEditField(item.exercise_id, 'rest_seconds', parseInt(val) || 0)}
                          style={[styles.paramInputEdit, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                        />
                      </View>
                    </View>
                  </Surface>
                ))
              )}

              <Button
                mode="outlined"
                icon={() => <Plus size={16} color={theme.colors.primary} />}
                onPress={() => setAddExercisesModalVisible(true)}
                style={{ marginTop: 16 }}
              >
                Añadir Ejercicio
              </Button>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Botones de acción inferiores */}
          <Surface style={[styles.modalFooter, { backgroundColor: theme.colors.elevation.level1 }]} elevation={3}>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button
                mode="outlined"
                style={{ flex: 1 }}
                onPress={() => setEditModalVisible(false)}
                disabled={isSavingEdit}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                style={{ flex: 1, backgroundColor: theme.colors.primary }}
                labelStyle={{ color: theme.colors.onPrimary }}
                onPress={handleSaveEdit}
                loading={isSavingEdit}
                disabled={isSavingEdit}
              >
                Guardar
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* ========================================================================= */}
      {/* SUB-MODAL AÑADIR EJERCICIOS                                              */}
      {/* ========================================================================= */}
      <Portal>
        <Modal
          visible={addExercisesModalVisible}
          onDismiss={() => setAddExercisesModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background, marginTop: 70 }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <IconButton icon="arrow-left" size={24} onPress={() => setAddExercisesModalVisible(false)} />
            <Text style={[styles.modalHeaderTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
              Buscar Ejercicios
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={{ padding: 12, gap: 8 }}>
            <Searchbar
              placeholder="Buscar por nombre..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ borderRadius: 12, elevation: 1 }}
              icon="magnify"
              clearIcon="close"
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {MUSCLE_GROUPS.map((muscle) => (
                <Chip
                  key={muscle}
                  selected={selectedMuscle === muscle}
                  onPress={() => setSelectedMuscle(muscle)}
                  style={{ marginRight: 6, height: 32 }}
                  selectedColor={theme.colors.primary}
                >
                  {muscle}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.muscle_group}
                titleStyle={{ fontSize: 14, fontWeight: '600' }}
                descriptionStyle={{ color: theme.colors.primary, fontSize: 12 }}
                left={() => (
                  <Avatar.Image
                    size={44}
                    source={{ uri: item.image_url || 'PLACEHOLDER_IMAGE' }}
                    style={{ backgroundColor: theme.colors.surfaceVariant, alignSelf: 'center' }}
                  />
                )}
                right={() => (
                  <IconButton
                    icon="plus-circle"
                    iconColor={theme.colors.primary}
                    size={26}
                    onPress={() => handleAddExerciseToWorkout(item)}
                  />
                )}
                style={{ paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: theme.colors.outlineVariant }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyExercisesEdit}>
                <Text style={{ color: theme.colors.outline }}>No se encontraron ejercicios</Text>
              </View>
            }
          />

          <View style={{ padding: 16, backgroundColor: theme.colors.elevation.level1 }}>
            <Button mode="contained" onPress={() => setAddExercisesModalVisible(false)}>
              Listo
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{ marginBottom: insets.bottom + 8 }}
      >
        {snackbarMessage}
      </Snackbar>
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
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  workoutCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    paddingBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    height: 24,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  previewContainer: {
    minHeight: 80,
    gap: 6,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    fontSize: 13,
    flex: 1,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
    gap: 8,
  },
  cardBtn: {
    flex: 1,
    borderRadius: 12,
  },
  addWorkoutCard: {
    width: CARD_WIDTH * 0.85,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    height: '100%',
    minHeight: 240,
  },
  addIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addWorkoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addWorkoutSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  quickAddBtn: {
    borderRadius: 16,
    paddingVertical: 4,
  },
  modalContainer: {
    flex: 1,
    margin: 0,
    marginTop: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  workoutSetCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  workoutSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutSetName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  exerciseParamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paramControl: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    overflow: 'hidden',
    height: 40,
  },
  stepperBtn: {
    margin: 0,
    borderRadius: 0,
    width: 32,
    height: '100%',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 0,
  },
  setsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 4,
  },
  setCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  finishBtn: {
    borderRadius: 14,
    paddingVertical: 6,
  },
  editNameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyExercisesEdit: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  editExerciseCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  editExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paramItemEdit: {
    flex: 1,
    alignItems: 'center',
  },
  paramLabelEdit: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  paramInputEdit: {
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

// (En tu proyecto de la app móvil) lib/api.ts

// URL base de la API. En desarrollo usa localhost (o tu IP), en producción leerá la de Vercel.
const BASE_URL = 'https://flux-backend-adrians-projects-3ead0681.vercel.app/api';

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://flux-backend-e9flgx4cc-adrians-projects-3ead0681.vercel.app/api';

// ========== NOTAS (existentes) ==========
export interface ChecklistItem {
    id: string;
    note_id: string;
    text: string;
    is_completed: boolean;
}

export interface AnyNote {
    id: string;
    title: string;
    content: string | null;
    type: 'note' | 'checklist' | 'idea';
    color: string | null;
    created_at: string;
    updated_at: string;
    items?: ChecklistItem[];
    tags?: string[];
}

export interface CreateNoteInput {
    title: string;
    type: 'note' | 'checklist' | 'idea';
    content?: string;
    color?: string;
}

export async function getNotes(): Promise<AnyNote[]> {
    const res = await fetch(`${BASE_URL}/notes`);
    if (!res.ok) throw new Error('Error al cargar notas');
    return res.json();
}

export async function createNote(data: CreateNoteInput): Promise<AnyNote> {
    const res = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear nota');
    return res.json();
}

export async function deleteNote(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar nota');
}

// ========== EJERCICIOS ==========
export interface Exercise {
    id: string;
    name: string;
    muscle_group: string;
    image_url: string;
}

export async function getExercises(muscleGroup?: string): Promise<Exercise[]> {
    const url = muscleGroup
        ? `${BASE_URL}/exercises?muscle=${encodeURIComponent(muscleGroup)}`
        : `${BASE_URL}/exercises`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar ejercicios");
    return res.json();
}

// ========== WORKOUTS (ENTRENAMIENTOS) ==========

export interface WorkoutExercise {
    id: number;
    exercise_id: string;
    exercise_name: string;
    exercise_image: string;
    muscle_group: string;
    sets: number;
    reps: number;
    weight: number;
    rest_seconds: number;
    order_index: number;
    notes: string | null;
}

export interface Workout {
    id: number;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    exercises: WorkoutExercise[];
}

export interface CreateWorkoutInput {
    name: string;
    user_id: string;
}

export interface AddExerciseToWorkoutInput {
    exercise_id: string;
    sets?: number;
    reps?: number;
    weight?: number;
    rest_seconds?: number;
    order_index?: number;
    notes?: string;
}

export async function getWorkouts(userId: string): Promise<Workout[]> {
    const res = await fetch(`${BASE_URL}/workouts?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Error al cargar entrenamientos');
    return res.json();
}

export async function createWorkout(data: CreateWorkoutInput): Promise<Workout> {
    const res = await fetch(`${BASE_URL}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear entrenamiento');
    return res.json();
}

export async function getWorkoutDetail(id: number): Promise<Workout> {
    const res = await fetch(`${BASE_URL}/workouts/${id}`);
    if (!res.ok) throw new Error('Error al cargar detalle del entrenamiento');
    return res.json();
}

export async function deleteWorkout(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/workouts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar entrenamiento');
}

export async function addExerciseToWorkout(
    workoutId: number,
    data: AddExerciseToWorkoutInput | AddExerciseToWorkoutInput[]
): Promise<{ count: number; exercises: any[] }> {
    const res = await fetch(`${BASE_URL}/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al añadir ejercicio al entrenamiento');
    return res.json();
}

export async function updateWorkoutExercises(
    workoutId: number,
    data: AddExerciseToWorkoutInput[]
): Promise<{ count: number; exercises: any[] }> {
    const res = await fetch(`${BASE_URL}/workouts/${workoutId}/exercises`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar ejercicios del entrenamiento');
    return res.json();
}

export async function updateWorkout(
    id: number,
    data: { name: string }
): Promise<Workout> {
    const res = await fetch(`${BASE_URL}/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar entrenamiento');
    return res.json();
}
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Definimos la estructura estricta de los datos de usuario
export interface UserProfile {
    altura: string;
    peso: string;
    edad: string;
    sexo: string;
    actividad: string;
    objetivo: string;
}

export type DistribucionType = 'equilibrada' | 'alta_proteina' | 'cetogenica' | 'alta_carbohidratos' | 'personalizada';

export interface CalorySettings {
    auto: boolean;
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    distribucion: DistribucionType;
    customProteinas?: number;   // % personalizado
    customCarbohidratos?: number;
    customGrasas?: number;
}

const PROFILE_KEY = '@user_metabolic_profile';
const CALORY_SETTINGS_KEY = '@calory_settings';

/**
 * Guarda o actualiza por completo el perfil del usuario
 */
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(profile);
        await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
    } catch (error) {
        console.error('Error al guardar el perfil de usuario:', error);
        throw error;
    }
};

/**
 * Recupera los datos guardados del perfil (devuelve null si no hay nada)
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) as UserProfile : null;
    } catch (error) {
        console.error('Error al recuperar el perfil de usuario:', error);
        return null;
    }
};

export const saveCalorySettings = async (settings: CalorySettings): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(settings);
        await AsyncStorage.setItem(CALORY_SETTINGS_KEY, jsonValue);
    } catch (error) {
        console.error('Error al guardar la configuracion de calorias:', error);
        throw error;
    }
};

export const getCalorySettings = async (): Promise<CalorySettings | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(CALORY_SETTINGS_KEY);
        return jsonValue != null ? (JSON.parse(jsonValue) as CalorySettings) : null;
    } catch (error) {
        console.error('Error al recuperar la configuracion de calorias:', error);
        return null;
    }
};
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'CONSUMED_FOODS';

export type ConsumedFood = {
  id: string;
  nombreAlimento: string;
  marca: string;
  medida: string;
  cantidad: string;
  calorias: string;
  carbohidratos: string;
  proteinas: string;
  grasas: string;
  fecha: string; // formato YYYY-MM-DD
  comida: string; // Desayuno | Comida | Cena
};

/** Obtener todos los alimentos consumidos guardados en local */
export async function getAllConsumedFoods(): Promise<ConsumedFood[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Obtener alimentos consumidos filtrados por fecha */
export async function getConsumedFoodsByDate(fecha: string): Promise<ConsumedFood[]> {
  const all = await getAllConsumedFoods();
  return all.filter((f) => f.fecha === fecha);
}

/** Añadir un nuevo alimento consumido */
export async function addConsumedFood(food: Omit<ConsumedFood, 'id'>): Promise<void> {
  const all = await getAllConsumedFoods();
  const newFood: ConsumedFood = {
    ...food,
    id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
  };
  all.push(newFood);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Eliminar un alimento consumido por id */
export async function removeConsumedFood(id: string): Promise<void> {
  const all = await getAllConsumedFoods();
  const filtered = all.filter((f) => f.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function updateConsumedFood(id: string, updatedFields: Partial<Omit<ConsumedFood, 'id' | 'fecha' | 'comida'>>): Promise<void> {
  try {
    const all = await getAllConsumedFoods();
    const index = all.findIndex((f) => f.id === id);

    if (index === -1) {
      console.warn(`No se encontró ningún alimento con el id: ${id}`);
      return;
    }

    all[index] = {
      ...all[index],
      ...updatedFields,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Error al actualizar el alimento en AsyncStorage:', error);
    throw error;
  }
}

/*
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'CONSUMED_FOODS_DICT'; // Cambié la clave por seguridad al cambiar la estructura

export type ConsumedFood = {
  id: string;
  nombreAlimento: string;
  marca: string;
  medida: string;
  cantidad: string;
  calorias: string;
  carbohidratos: string;
  proteinas: string;
  grasas: string;
  fecha: string; // formato YYYY-MM-DD
  comida: string; // Desayuno | Comida | Cena
};

// Ahora nuestra estructura en AsyncStorage será un objeto: { "2026-05-21": [Food, Food], "2026-05-22": [Food] }
type ConsumedFoodsDictionary = {
  [fecha: string]: ConsumedFood[];
};


async function getRawDictionary(): Promise<ConsumedFoodsDictionary> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}


export async function getConsumedFoodsByDate(fecha: string): Promise<ConsumedFood[]> {
  const dict = await getRawDictionary();
  return dict[fecha] || []; // ⚡ Acceso instantáneo por clave, sin hacer .filter() de todo el historial
}

export async function addConsumedFood(food: Omit<ConsumedFood, 'id'>): Promise<void> {
  const dict = await getRawDictionary();
  const fecha = food.fecha;

  const newFood: ConsumedFood = {
    ...food,
    id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
  };

  // Si no existen alimentos para ese día, inicializamos el array vació
  if (!dict[fecha]) {
    dict[fecha] = [];
  }

  dict[fecha].push(newFood);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
}

export async function removeConsumedFood(id: string, fecha: string): Promise<void> {
  const dict = await getRawDictionary();
  
  // Sabiendo la fecha, solo limpiamos el array de ese día específico
  if (dict[fecha]) {
    dict[fecha] = dict[fecha].filter((f) => f.id !== id);
    
    // Opcional: si el día se queda vacío, borramos la clave para ahorrar espacio
    if (dict[fecha].length === 0) {
      delete dict[fecha];
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
  }
}

export async function getAllConsumedFoods(): Promise<ConsumedFood[]> {
  const dict = await getRawDictionary();
  
  return Object.values(dict).flat();
}
*/
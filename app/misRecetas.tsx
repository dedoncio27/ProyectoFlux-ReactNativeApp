import { FoodBrowserLayout } from '@/components/food-browser-layout';

export default function MisRecetasScreen() {
  return (
    <FoodBrowserLayout
      title="Recetas"
      placeholder="Buscar en mis recetas..."
      activeTab="/misRecetas"
      emptyText="Aun no hay alimentos"
      showAddButton
      addButtonText="Anadir nueva receta"
    />
  );
}

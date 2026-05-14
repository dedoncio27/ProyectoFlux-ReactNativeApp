import { FoodBrowserLayout } from '@/components/food-browser-layout';

export default function BibliotecaGlobalScreen() {
  return (
    <FoodBrowserLayout
      title="Biblioteca Global"
      placeholder="Buscar alimento..."
      activeTab="/bibliotecaGlobal"
      emptyText="Busca tus alimentos"
    />
  );
}

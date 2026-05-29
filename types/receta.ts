/**
 * Clase Receta para mapear los datos de recetas estructurados en la base de datos de Firebase.
 * Incluye el método `toListItem()` para poder reutilizar el componente `<AlimentoItem />`.
 */
export class Receta {
  id: string;
  email: string;
  nombreReceta: string;
  descripcion: string;
  caloriasReceta: string;
  cantidadMedidaReceta: string;
  cantidadTotalReceta: string;
  carbohidratosReceta: string;
  proteinasReceta: string;
  grasasReceta: string;
  medidaReceta: string;
  alimentosReceta: string[];
  cantidadesReceta: Record<string, string>;

  constructor(id: string, data: any) {
    this.id = id;
    this.email = data.email || '';
    this.nombreReceta = data.NombreReceta || '';
    this.descripcion = data.Descripcion || '';
    this.caloriasReceta = String(data.CaloriasReceta ?? '0');
    this.cantidadMedidaReceta = String(data.CantidadMedidaReceta ?? '0');
    this.cantidadTotalReceta = String(data.CantidadTotalReceta ?? '0');
    this.carbohidratosReceta = String(data.CarbohidratosReceta ?? '0');
    this.proteinasReceta = String(data.ProteinasReceta ?? '0');
    this.grasasReceta = String(data.GrasasReceta ?? '0');
    this.medidaReceta = data.MedidaReceta || 'g';
    this.alimentosReceta = Array.isArray(data.AlimentosReceta) ? data.AlimentosReceta : [];
    this.cantidadesReceta = data.CantidadesReceta || {};
  }

  /**
   * Convierte la instancia de Receta al tipo `AlimentoListItem`
   * para poder ser renderizada por el componente visual genérico `AlimentoItem`.
   */
  toListItem() {
    return {
      nombreAlimento: this.nombreReceta,
      cantidad: this.cantidadTotalReceta,
      medida: this.medidaReceta,
      calorias: this.caloriasReceta,
      carbohidratos: this.carbohidratosReceta,
      proteinas: this.proteinasReceta,
      grasas: this.grasasReceta,
    };
  }
}

/**
 * Clase Alimento para mapear los datos estructurados en la base de datos de Firebase
 * (que usa claves con mayúscula inicial como "NombreAlimento", "Calorias")
 * a propiedades más amigables en JavaScript/TypeScript, y proveer un método para la UI.
 */
export class Alimento {
  id: string;
  email: string;
  nombreAlimento: string;
  marca: string;
  medida: string;
  cantidad: string;
  calorias: string;
  carbohidratos: string;
  proteinas: string;
  grasas: string;
  descripcion: string;

  constructor(id: string, data: any) {
    this.id = id;
    this.email = data.email || '';
    this.nombreAlimento = data.NombreAlimento || '';
    this.marca = data.Marca || '';
    this.medida = data.Medida || 'g';
    this.cantidad = String(data.Cantidad ?? '0');
    this.calorias = String(data.Calorias ?? '0');
    this.carbohidratos = String(data.Carbohidratos ?? '0');
    this.proteinas = String(data.Proteinas ?? '0');
    this.grasas = String(data.Grasas ?? '0');
    this.descripcion = data.Descripcion || '';
  }

  /**
   * Convierte la instancia de Alimento al tipo `AlimentoListItem`
   * requerido por el componente visual `AlimentoItem`.
   */
  toListItem() {
    return {
      nombreAlimento: this.nombreAlimento,
      cantidad: this.cantidad,
      medida: this.medida,
      calorias: this.calorias,
      carbohidratos: this.carbohidratos,
      proteinas: this.proteinas,
      grasas: this.grasas,
    };
  }
}

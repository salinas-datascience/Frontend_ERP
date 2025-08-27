import { repuestosApi } from '../api';

// Tipos para analytics de IA
export interface RepuestoAnalytics {
  id: number;
  codigo: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo: number;
  consumo_promedio_mensual: number;
  tendencia_consumo: 'creciente' | 'estable' | 'decreciente';
  dias_hasta_agotamiento: number;
  stock_sugerido: number;
  nivel_criticidad: 'bajo' | 'medio' | 'alto' | 'critico';
  prediccion_demanda_30dias: number;
  prediccion_demanda_60dias: number;
  prediccion_demanda_90dias: number;
  patron_estacional: boolean;
  meses_alta_demanda: number[];
  confiabilidad_prediccion: number; // 0-100%
  alertas: string[];
}

export interface StockPrediction {
  repuesto_id: number;
  fecha_prediccion: string;
  demanda_esperada: number;
  stock_recomendado: number;
  momento_pedido_sugerido: string;
  confianza: number;
}

export interface ConsumptionPattern {
  mes: number;
  año: number;
  cantidad_consumida: number;
  numero_ordenes: number;
  maquinas_involucradas: string[];
  costo_total: number;
}

// Clase para análisis de repuestos con IA
export class RepuestosAnalyticsService {
  
  // Obtener analytics completos de repuestos
  static async getRepuestosAnalytics(): Promise<RepuestoAnalytics[]> {
    try {
      // Por ahora simulamos los datos, luego se conectará con el backend
      const repuestos = await repuestosApi.getAll();
      // const historialUso = await historialApi.getRepuestosHistory(); // Este endpoint necesitaría crearse
      
      // Por ahora usamos datos mock mientras se desarrolla la API de historial
      return this.getMockAnalytics();
      // return this.processAnalytics(repuestos.items, historialUso);
    } catch (error) {
      console.error('Error fetching repuestos analytics:', error);
      // Retornar datos simulados para desarrollo
      return this.getMockAnalytics();
    }
  }

  // Procesar datos reales con algoritmos de IA
  private static processAnalytics(repuestos: any[], historial: any[]): RepuestoAnalytics[] {
    return repuestos.map(repuesto => {
      const consumoHistorial = historial.filter(h => h.repuesto_id === repuesto.id);
      
      // Calcular consumo promedio mensual
      const consumoPromedio = this.calcularConsumoPromedio(consumoHistorial);
      
      // Detectar tendencia
      const tendencia = this.detectarTendencia(consumoHistorial);
      
      // Predecir demanda futura
      const predicciones = this.predecirDemanda(consumoHistorial);
      
      // Detectar patrón estacional
      const patronEstacional = this.detectarPatronEstacional(consumoHistorial);
      
      // Calcular días hasta agotamiento
      const diasAgotamiento = consumoPromedio > 0 
        ? Math.floor(repuesto.stock_actual / (consumoPromedio / 30))
        : 999;
      
      // Generar alertas
      const alertas = this.generarAlertas(repuesto, consumoPromedio, diasAgotamiento);
      
      return {
        id: repuesto.id,
        codigo: repuesto.codigo,
        descripcion: repuesto.descripcion,
        stock_actual: repuesto.stock_actual,
        stock_minimo: repuesto.stock_minimo,
        consumo_promedio_mensual: consumoPromedio,
        tendencia_consumo: tendencia,
        dias_hasta_agotamiento: diasAgotamiento,
        stock_sugerido: this.calcularStockSugerido(consumoPromedio, tendencia),
        nivel_criticidad: this.determinarCriticidad(diasAgotamiento, repuesto.stock_minimo),
        ...predicciones,
        ...patronEstacional,
        confiabilidad_prediccion: this.calcularConfiabilidad(consumoHistorial.length),
        alertas
      };
    });
  }

  private static calcularConsumoPromedio(historial: any[]): number {
    if (historial.length === 0) return 0;
    
    const totalConsumo = historial.reduce((sum, item) => sum + item.cantidad, 0);
    const mesesHistorial = Math.max(1, historial.length / 4); // Aproximadamente 4 registros por mes
    
    return Math.round(totalConsumo / mesesHistorial);
  }

  private static detectarTendencia(historial: any[]): 'creciente' | 'estable' | 'decreciente' {
    if (historial.length < 3) return 'estable';
    
    const ultimos3Meses = historial.slice(-3);
    const primeros3Meses = historial.slice(0, 3);
    
    const promedioReciente = ultimos3Meses.reduce((sum, item) => sum + item.cantidad, 0) / ultimos3Meses.length;
    const promedioAntiguo = primeros3Meses.reduce((sum, item) => sum + item.cantidad, 0) / primeros3Meses.length;
    
    const diferencia = ((promedioReciente - promedioAntiguo) / promedioAntiguo) * 100;
    
    if (diferencia > 15) return 'creciente';
    if (diferencia < -15) return 'decreciente';
    return 'estable';
  }

  private static predecirDemanda(historial: any[]) {
    if (historial.length === 0) {
      return {
        prediccion_demanda_30dias: 0,
        prediccion_demanda_60dias: 0,
        prediccion_demanda_90dias: 0
      };
    }

    // Algoritmo simple de regresión lineal
    const consumoPromedio = historial.reduce((sum, item) => sum + item.cantidad, 0) / historial.length;
    const tendenciaFactor = this.detectarTendencia(historial) === 'creciente' ? 1.1 : 
                           this.detectarTendencia(historial) === 'decreciente' ? 0.9 : 1.0;

    return {
      prediccion_demanda_30dias: Math.round(consumoPromedio * tendenciaFactor),
      prediccion_demanda_60dias: Math.round(consumoPromedio * 2 * tendenciaFactor),
      prediccion_demanda_90dias: Math.round(consumoPromedio * 3 * tendenciaFactor)
    };
  }

  private static detectarPatronEstacional(historial: any[]) {
    // Analizar si hay patrones por mes
    const consumoPorMes = {};
    historial.forEach(item => {
      const mes = new Date(item.fecha).getMonth();
      consumoPorMes[mes] = (consumoPorMes[mes] || 0) + item.cantidad;
    });

    const meses = Object.keys(consumoPorMes).map(Number);
    const consumos = Object.values(consumoPorMes) as number[];
    
    if (consumos.length < 3) {
      return {
        patron_estacional: false,
        meses_alta_demanda: []
      };
    }

    const promedioConsumo = consumos.reduce((sum, val) => sum + val, 0) / consumos.length;
    const mesesAltaDemanda = meses.filter(mes => consumoPorMes[mes] > promedioConsumo * 1.3);

    return {
      patron_estacional: mesesAltaDemanda.length > 0,
      meses_alta_demanda: mesesAltaDemanda
    };
  }

  private static calcularStockSugerido(consumoPromedio: number, tendencia: string): number {
    let factor = 2; // Base: 2 meses de stock
    
    if (tendencia === 'creciente') factor = 2.5;
    if (tendencia === 'decreciente') factor = 1.5;
    
    return Math.round(consumoPromedio * factor);
  }

  private static determinarCriticidad(diasAgotamiento: number, stockMinimo: number): 'bajo' | 'medio' | 'alto' | 'critico' {
    if (diasAgotamiento <= 7) return 'critico';
    if (diasAgotamiento <= 15) return 'alto';
    if (diasAgotamiento <= 30) return 'medio';
    return 'bajo';
  }

  private static calcularConfiabilidad(cantidadDatos: number): number {
    if (cantidadDatos >= 12) return 90;
    if (cantidadDatos >= 6) return 75;
    if (cantidadDatos >= 3) return 60;
    return 40;
  }

  private static generarAlertas(repuesto: any, consumoPromedio: number, diasAgotamiento: number): string[] {
    const alertas: string[] = [];

    if (repuesto.stock_actual <= repuesto.stock_minimo) {
      alertas.push('🔴 Stock por debajo del mínimo establecido');
    }

    if (diasAgotamiento <= 7) {
      alertas.push('⚠️ Stock crítico: se agotará en menos de 7 días');
    } else if (diasAgotamiento <= 15) {
      alertas.push('⚡ Stock bajo: se agotará en menos de 15 días');
    }

    if (consumoPromedio === 0 && repuesto.stock_actual > 0) {
      alertas.push('📊 Sin consumo reciente: revisar necesidad de stock');
    }

    if (repuesto.stock_actual > consumoPromedio * 6) {
      alertas.push('📈 Posible sobrestock: considerar reducir pedidos');
    }

    return alertas;
  }

  // Datos mock para desarrollo
  private static getMockAnalytics(): RepuestoAnalytics[] {
    return [
      {
        id: 1,
        codigo: "FIL001",
        descripcion: "Filtro de aceite motor principal",
        stock_actual: 5,
        stock_minimo: 10,
        consumo_promedio_mensual: 8,
        tendencia_consumo: 'creciente',
        dias_hasta_agotamiento: 18,
        stock_sugerido: 20,
        nivel_criticidad: 'alto',
        prediccion_demanda_30dias: 9,
        prediccion_demanda_60dias: 18,
        prediccion_demanda_90dias: 27,
        patron_estacional: true,
        meses_alta_demanda: [3, 4, 9, 10],
        confiabilidad_prediccion: 85,
        alertas: ['🔴 Stock por debajo del mínimo establecido', '⚡ Stock bajo: se agotará en menos de 15 días']
      },
      {
        id: 2,
        codigo: "ROD001",
        descripcion: "Rodamiento 6205-2RS",
        stock_actual: 25,
        stock_minimo: 15,
        consumo_promedio_mensual: 4,
        tendencia_consumo: 'estable',
        dias_hasta_agotamiento: 187,
        stock_sugerido: 12,
        nivel_criticidad: 'bajo',
        prediccion_demanda_30dias: 4,
        prediccion_demanda_60dias: 8,
        prediccion_demanda_90dias: 12,
        patron_estacional: false,
        meses_alta_demanda: [],
        confiabilidad_prediccion: 90,
        alertas: ['📈 Posible sobrestock: considerar reducir pedidos']
      },
      {
        id: 3,
        codigo: "BEL002",
        descripcion: "Correa transmisión tipo A",
        stock_actual: 2,
        stock_minimo: 5,
        consumo_promedio_mensual: 3,
        tendencia_consumo: 'creciente',
        dias_hasta_agotamiento: 20,
        stock_sugerido: 9,
        nivel_criticidad: 'alto',
        prediccion_demanda_30dias: 4,
        prediccion_demanda_60dias: 8,
        prediccion_demanda_90dias: 12,
        patron_estacional: true,
        meses_alta_demanda: [6, 7, 8],
        confiabilidad_prediccion: 75,
        alertas: ['🔴 Stock por debajo del mínimo establecido', '⚡ Stock bajo: se agotará en menos de 15 días']
      }
    ];
  }

  // Obtener repuestos críticos que necesitan reabastecimiento urgente
  static async getRepuestosCriticos(): Promise<RepuestoAnalytics[]> {
    const analytics = await this.getRepuestosAnalytics();
    return analytics.filter(item => 
      item.nivel_criticidad === 'critico' || 
      item.nivel_criticidad === 'alto' ||
      item.dias_hasta_agotamiento <= 30
    ).sort((a, b) => a.dias_hasta_agotamiento - b.dias_hasta_agotamiento);
  }

  // Obtener recomendaciones de compra
  static async getRecomendacionesCompra(): Promise<{
    repuesto: RepuestoAnalytics;
    cantidad_sugerida: number;
    prioridad: 'alta' | 'media' | 'baja';
    razon: string;
  }[]> {
    const analytics = await this.getRepuestosAnalytics();
    
    return analytics
      .filter(item => item.stock_actual < item.stock_sugerido || item.nivel_criticidad !== 'bajo')
      .map(repuesto => ({
        repuesto,
        cantidad_sugerida: Math.max(
          repuesto.stock_sugerido - repuesto.stock_actual,
          repuesto.prediccion_demanda_60dias
        ),
        prioridad: repuesto.nivel_criticidad === 'critico' ? 'alta' :
                   repuesto.nivel_criticidad === 'alto' ? 'media' : 'baja',
        razon: repuesto.dias_hasta_agotamiento <= 15 
          ? `Stock crítico: ${repuesto.dias_hasta_agotamiento} días restantes`
          : `Optimización de stock basada en tendencia ${repuesto.tendencia_consumo}`
      }))
      .sort((a, b) => {
        const prioridadOrder = { alta: 3, media: 2, baja: 1 };
        return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
      });
  }
}
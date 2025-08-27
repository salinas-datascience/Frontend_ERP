import React, { useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { RepuestoAnalytics } from '../../../services/aiAnalytics';

interface StockPredictionChartProps {
  data: RepuestoAnalytics[];
  timeframe: '30' | '60' | '90';
}

export const StockPredictionChart: React.FC<StockPredictionChartProps> = ({ data, timeframe }) => {
  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const top10Items = data
      .filter(item => item.nivel_criticidad !== 'bajo' || item.stock_actual < item.stock_sugerido)
      .sort((a, b) => {
        // Priorizar por criticidad y días hasta agotamiento
        const criticidadOrder = { critico: 4, alto: 3, medio: 2, bajo: 1 };
        const aPriority = criticidadOrder[a.nivel_criticidad] * 100 - a.dias_hasta_agotamiento;
        const bPriority = criticidadOrder[b.nivel_criticidad] * 100 - b.dias_hasta_agotamiento;
        return bPriority - aPriority;
      })
      .slice(0, 10);

    return top10Items.map(item => {
      let prediccion = item.prediccion_demanda_30dias;
      if (timeframe === '60') prediccion = item.prediccion_demanda_60dias;
      if (timeframe === '90') prediccion = item.prediccion_demanda_90dias;

      const stockFinal = Math.max(0, item.stock_actual - prediccion);
      const porcentajeStock = item.stock_actual > 0 ? (stockFinal / item.stock_actual) * 100 : 0;

      return {
        ...item,
        prediccion,
        stockFinal,
        porcentajeStock,
        necesitaPedido: stockFinal < item.stock_minimo
      };
    });
  }, [data, timeframe]);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'decreciente':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getCriticidadColor = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-600';
      case 'alto':
        return 'bg-orange-600';
      case 'medio':
        return 'bg-yellow-600';
      default:
        return 'bg-green-600';
    }
  };

  const getStockBarColor = (porcentaje: number, necesitaPedido: boolean) => {
    if (necesitaPedido) return 'bg-red-500';
    if (porcentaje < 30) return 'bg-orange-500';
    if (porcentaje < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Predicción de Stock ({timeframe} días)
          </h3>
          <p className="text-gray-400 text-sm">
            Items prioritarios y proyección de consumo
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Confianza promedio</p>
          <p className="text-lg font-semibold text-blue-400">
            {Math.round(chartData.reduce((sum, item) => sum + item.confiabilidad_prediccion, 0) / chartData.length || 0)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.id} className="bg-gray-800 rounded-lg p-4">
            {/* Header del item */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-sm text-blue-400">{item.codigo}</p>
                  <Badge size="xs" className={getCriticidadColor(item.nivel_criticidad)}>
                    {item.nivel_criticidad}
                  </Badge>
                  {getTendenciaIcon(item.tendencia_consumo)}
                </div>
                <p className="text-sm text-white truncate" title={item.descripcion}>
                  {item.descripcion}
                </p>
              </div>
              <div className="text-right text-xs text-gray-400 ml-4">
                #{index + 1}
              </div>
            </div>

            {/* Información de stock */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">Stock Actual</p>
                <p className="text-lg font-semibold text-white">{item.stock_actual}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Consumo Proyectado</p>
                <p className="text-lg font-semibold text-orange-400">{item.prediccion}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Stock Final</p>
                <p className={`text-lg font-semibold ${
                  item.stockFinal < item.stock_minimo ? 'text-red-400' : 'text-green-400'
                }`}>
                  {item.stockFinal}
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Nivel de stock proyectado</span>
                <span>{Math.round(item.porcentajeStock)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStockBarColor(item.porcentajeStock, item.necesitaPedido)}`}
                  style={{ width: `${Math.max(5, item.porcentajeStock)}%` }}
                />
              </div>
              {/* Línea de stock mínimo */}
              {item.stock_actual > 0 && (
                <div 
                  className="w-0.5 h-4 bg-blue-400 relative -mt-3"
                  style={{ 
                    left: `${Math.min(95, (item.stock_minimo / item.stock_actual) * 100)}%`
                  }}
                  title={`Stock mínimo: ${item.stock_minimo}`}
                />
              )}
            </div>

            {/* Alertas e indicadores */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.necesitaPedido && (
                  <Badge size="xs" className="bg-red-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Pedido necesario
                  </Badge>
                )}
                {item.patron_estacional && (
                  <Badge size="xs" className="bg-purple-600">
                    📅 Estacional
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{item.confiabilidad_prediccion}% confianza</span>
                <span>{item.dias_hasta_agotamiento}d restantes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay datos suficientes para generar predicciones</p>
        </div>
      )}
    </Card>
  );
};
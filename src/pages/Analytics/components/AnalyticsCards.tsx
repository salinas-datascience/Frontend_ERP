import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  Clock,
  Calendar,
  BarChart3
} from 'lucide-react';
import type { RepuestoAnalytics } from '../../../services/aiAnalytics';

interface AnalyticsCardsProps {
  repuestosAnalytics: RepuestoAnalytics[];
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ repuestosAnalytics }) => {
  // Obtener los top items por diferentes criterios
  const topCriticos = repuestosAnalytics
    .filter(r => r.nivel_criticidad === 'critico')
    .slice(0, 3);

  const mayorConsumo = repuestosAnalytics
    .sort((a, b) => b.consumo_promedio_mensual - a.consumo_promedio_mensual)
    .slice(0, 3);

  const tendenciaCreciente = repuestosAnalytics
    .filter(r => r.tendencia_consumo === 'creciente')
    .sort((a, b) => b.prediccion_demanda_60dias - a.prediccion_demanda_60dias)
    .slice(0, 3);

  const patronEstacional = repuestosAnalytics
    .filter(r => r.patron_estacional)
    .slice(0, 3);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreciente':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Items Críticos */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-white">Items Críticos</h3>
        </div>
        <div className="space-y-3">
          {topCriticos.length > 0 ? topCriticos.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-blue-400">{item.codigo}</p>
                  <p className="text-sm text-white truncate" title={item.descripcion}>
                    {item.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge size="xs" className={getCriticidadColor(item.nivel_criticidad)}>
                      {item.nivel_criticidad}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {item.dias_hasta_agotamiento}d restantes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm text-center py-4">
              ✅ No hay items críticos
            </p>
          )}
        </div>
      </Card>

      {/* Mayor Consumo */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-white">Mayor Consumo</h3>
        </div>
        <div className="space-y-3">
          {mayorConsumo.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-blue-400">{item.codigo}</p>
                  <p className="text-sm text-white truncate" title={item.descripcion}>
                    {item.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getTendenciaIcon(item.tendencia_consumo)}
                    <span className="text-xs text-gray-400">
                      {item.consumo_promedio_mensual}/mes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tendencia Creciente */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-white">Demanda Creciente</h3>
        </div>
        <div className="space-y-3">
          {tendenciaCreciente.length > 0 ? tendenciaCreciente.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-blue-400">{item.codigo}</p>
                  <p className="text-sm text-white truncate" title={item.descripcion}>
                    {item.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge size="xs" className="bg-green-600">
                      +{item.prediccion_demanda_60dias - item.consumo_promedio_mensual * 2}
                    </Badge>
                    <span className="text-xs text-gray-400">60d</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm text-center py-4">
              📊 Sin tendencias crecientes
            </p>
          )}
        </div>
      </Card>

      {/* Patrón Estacional */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-white">Patrón Estacional</h3>
        </div>
        <div className="space-y-3">
          {patronEstacional.length > 0 ? patronEstacional.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-blue-400">{item.codigo}</p>
                  <p className="text-sm text-white truncate" title={item.descripcion}>
                    {item.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge size="xs" className="bg-purple-600">
                      {item.meses_alta_demanda.length} meses pico
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {item.confiabilidad_prediccion}% confianza
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm text-center py-4">
              📅 Sin patrones detectados
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
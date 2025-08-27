import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AlertTriangle, ShoppingCart, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RepuestoAnalytics } from '../../../services/aiAnalytics';

interface CriticalItemsTableProps {
  repuestosCriticos: RepuestoAnalytics[];
  isLoading: boolean;
}

export const CriticalItemsTable: React.FC<CriticalItemsTableProps> = ({
  repuestosCriticos,
  isLoading
}) => {
  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente':
        return <TrendingUp className="w-4 h-4 text-green-500" title="Tendencia creciente" />;
      case 'decreciente':
        return <TrendingDown className="w-4 h-4 text-red-500" title="Tendencia decreciente" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" title="Tendencia estable" />;
    }
  };

  const getCriticidadColor = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-600 animate-pulse';
      case 'alto':
        return 'bg-orange-600';
      case 'medio':
        return 'bg-yellow-600';
      default:
        return 'bg-green-600';
    }
  };

  const getCriticidadText = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'CRÍTICO';
      case 'alto':
        return 'Alto';
      case 'medio':
        return 'Medio';
      default:
        return 'Bajo';
    }
  };

  const handleGenerateOrder = (repuesto: RepuestoAnalytics) => {
    // Esta función se conectaría con el sistema de órdenes de compra
    console.log('Generar orden de compra para:', repuesto.codigo);
    // Aquí iría la lógica para generar automáticamente una orden de compra
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
          <span className="ml-2 text-gray-400">Cargando items críticos...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-xl font-semibold text-white">Items Críticos y Prioritarios</h3>
            <p className="text-gray-400 text-sm">
              {repuestosCriticos.length} items requieren atención inmediata
            </p>
          </div>
        </div>
      </div>

      {repuestosCriticos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-green-500 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <p className="text-xl text-gray-300 mb-2">¡Excelente!</p>
          <p className="text-gray-400">No hay items críticos que requieran atención inmediata</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Código</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Descripción</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Stock</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Días Rest.</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Tendencia</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Criticidad</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Stock Sugerido</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {repuestosCriticos.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                    item.nivel_criticidad === 'critico' ? 'bg-red-900/10' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <p className="font-mono text-blue-400 font-medium">{item.codigo}</p>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="max-w-xs">
                      <p className="text-white text-sm truncate" title={item.descripcion}>
                        {item.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.patron_estacional && (
                          <Badge size="xs" className="bg-purple-600">📅</Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {item.confiabilidad_prediccion}% confianza
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm">
                      <p className={`font-semibold ${
                        item.stock_actual <= item.stock_minimo ? 'text-red-400' : 'text-white'
                      }`}>
                        {item.stock_actual}
                      </p>
                      <p className="text-xs text-gray-400">
                        mín: {item.stock_minimo}
                      </p>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm">
                      <p className={`font-semibold ${
                        item.dias_hasta_agotamiento <= 7 ? 'text-red-400' :
                        item.dias_hasta_agotamiento <= 15 ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        {item.dias_hasta_agotamiento}
                      </p>
                      <p className="text-xs text-gray-400">días</p>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getTendenciaIcon(item.tendencia_consumo)}
                      <span className="text-xs text-gray-400 capitalize">
                        {item.tendencia_consumo}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <Badge 
                      size="sm" 
                      className={`${getCriticidadColor(item.nivel_criticidad)} text-white`}
                    >
                      {getCriticidadText(item.nivel_criticidad)}
                    </Badge>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm">
                      <p className="font-semibold text-green-400">
                        {item.stock_sugerido}
                      </p>
                      <p className="text-xs text-gray-400">
                        +{item.stock_sugerido - item.stock_actual} unidades
                      </p>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateOrder(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                      title="Generar orden de compra automática"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Pedir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen de acciones recomendadas */}
      {repuestosCriticos.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-medium text-white mb-2">📋 Resumen de Acciones Recomendadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-red-400 font-medium">
                {repuestosCriticos.filter(r => r.nivel_criticidad === 'critico').length} items críticos
              </p>
              <p className="text-gray-400">Acción inmediata requerida</p>
            </div>
            <div>
              <p className="text-orange-400 font-medium">
                {repuestosCriticos.filter(r => r.dias_hasta_agotamiento <= 15).length} items urgentes
              </p>
              <p className="text-gray-400">Pedido en 48 horas</p>
            </div>
            <div>
              <p className="text-blue-400 font-medium">
                ${repuestosCriticos.reduce((sum, r) => sum + (r.stock_sugerido - r.stock_actual) * 100, 0).toLocaleString()}
              </p>
              <p className="text-gray-400">Inversión estimada</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
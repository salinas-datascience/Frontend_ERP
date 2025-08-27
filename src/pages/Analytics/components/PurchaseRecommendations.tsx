import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ShoppingCart, Brain, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface RecomendacionCompra {
  repuesto: any;
  cantidad_sugerida: number;
  prioridad: 'alta' | 'media' | 'baja';
  razon: string;
}

interface PurchaseRecommendationsProps {
  recomendaciones: RecomendacionCompra[];
  isLoading: boolean;
}

export const PurchaseRecommendations: React.FC<PurchaseRecommendationsProps> = ({
  recomendaciones,
  isLoading
}) => {
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-600';
      case 'media':
        return 'bg-orange-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <AlertTriangle className="w-3 h-3" />;
      case 'media':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const handleCreatePurchaseOrder = (recomendacion: RecomendacionCompra) => {
    // Esta función se conectaría con el sistema de órdenes de compra
    console.log('Crear orden de compra:', {
      repuesto: recomendacion.repuesto.codigo,
      cantidad: recomendacion.cantidad_sugerida,
      prioridad: recomendacion.prioridad
    });
    // Aquí iría la lógica para navegar o abrir el formulario de orden de compra
  };

  const handleCreateBulkOrder = () => {
    const recomendacionesAltas = recomendaciones.filter(r => r.prioridad === 'alta');
    console.log('Crear orden masiva para', recomendacionesAltas.length, 'items');
    // Aquí iría la lógica para crear una orden de compra masiva
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
          <span className="ml-2 text-gray-400">Generando recomendaciones...</span>
        </div>
      </Card>
    );
  }

  const recomendacionesAltas = recomendaciones.filter(r => r.prioridad === 'alta');
  const totalInversion = recomendaciones.reduce((sum, r) => sum + (r.cantidad_sugerida * 150), 0); // Estimación

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold text-white">Recomendaciones de Compra IA</h3>
            <p className="text-gray-400 text-sm">
              {recomendaciones.length} recomendaciones inteligentes generadas
            </p>
          </div>
        </div>
        
        {recomendacionesAltas.length > 0 && (
          <Button
            size="sm"
            onClick={handleCreateBulkOrder}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Orden Masiva ({recomendacionesAltas.length})
          </Button>
        )}
      </div>

      {/* Resumen de recomendaciones */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">
            {recomendaciones.filter(r => r.prioridad === 'alta').length}
          </p>
          <p className="text-xs text-gray-400">Prioridad Alta</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">
            {recomendaciones.filter(r => r.prioridad === 'media').length}
          </p>
          <p className="text-xs text-gray-400">Prioridad Media</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            ${totalInversion.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Inversión Est.</p>
        </div>
      </div>

      {/* Lista de recomendaciones */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recomendaciones.slice(0, 8).map((recomendacion, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-mono text-sm text-blue-400">
                    {recomendacion.repuesto.codigo}
                  </p>
                  <Badge 
                    size="xs" 
                    className={`${getPrioridadColor(recomendacion.prioridad)} text-white flex items-center gap-1`}
                  >
                    {getPrioridadIcon(recomendacion.prioridad)}
                    {recomendacion.prioridad.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-white mb-2 truncate" title={recomendacion.repuesto.descripcion}>
                  {recomendacion.repuesto.descripcion}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Cantidad Sugerida</p>
                    <p className="text-lg font-semibold text-green-400">
                      {recomendacion.cantidad_sugerida} unidades
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Stock Actual</p>
                    <p className="text-lg font-semibold text-white">
                      {recomendacion.repuesto.stock_actual}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded p-2 mb-3">
                  <p className="text-xs text-gray-300">
                    <span className="text-blue-400 font-medium">🤖 IA:</span> {recomendacion.razon}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Tendencia: {recomendacion.repuesto.tendencia_consumo}</span>
                    <span>{recomendacion.repuesto.confiabilidad_prediccion}% confianza</span>
                    {recomendacion.repuesto.patron_estacional && (
                      <Badge size="xs" className="bg-purple-600">📅 Estacional</Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreatePurchaseOrder(recomendacion)}
                    className="text-blue-400 border-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Crear OC
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recomendaciones.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-lg text-gray-300 mb-2">Optimización Completa</p>
          <p className="text-gray-400">
            El sistema IA no detecta necesidades urgentes de reabastecimiento
          </p>
        </div>
      )}

      {recomendaciones.length > 8 && (
        <div className="text-center mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Mostrando 8 de {recomendaciones.length} recomendaciones
          </p>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 mt-2">
            Ver todas las recomendaciones
          </Button>
        </div>
      )}

      {/* Información del algoritmo */}
      <div className="mt-6 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">
              Algoritmo de Optimización Inteligente
            </p>
            <p className="text-xs text-blue-200/80">
              Las recomendaciones se basan en análisis predictivo que considera: patrones históricos de consumo, 
              tendencias estacionales, lead times de proveedores, niveles de criticidad y optimización de costos de inventario.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
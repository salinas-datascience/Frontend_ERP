import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  ShoppingCart,
  Brain,
  BarChart3,
  Calendar,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { RepuestosAnalyticsService, type RepuestoAnalytics } from '../../services/aiAnalytics';
import { AnalyticsCards } from './components/AnalyticsCards';
import { StockPredictionChart } from './components/StockPredictionChart';
import { CriticalItemsTable } from './components/CriticalItemsTable';
import { PurchaseRecommendations } from './components/PurchaseRecommendations';

const AnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30' | '60' | '90'>('60');

  // Cargar analytics de repuestos
  const { data: repuestosAnalytics = [], isLoading: isLoadingAnalytics, refetch } = useQuery({
    queryKey: ['repuestos-analytics'],
    queryFn: RepuestosAnalyticsService.getRepuestosAnalytics,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });

  // Cargar repuestos críticos
  const { data: repuestosCriticos = [], isLoading: isLoadingCriticos } = useQuery({
    queryKey: ['repuestos-criticos'],
    queryFn: RepuestosAnalyticsService.getRepuestosCriticos,
    refetchInterval: 5 * 60 * 1000,
  });

  // Cargar recomendaciones de compra
  const { data: recomendacionesCompra = [], isLoading: isLoadingRecomendaciones } = useQuery({
    queryKey: ['recomendaciones-compra'],
    queryFn: RepuestosAnalyticsService.getRecomendacionesCompra,
    refetchInterval: 5 * 60 * 1000,
  });

  const isLoading = isLoadingAnalytics || isLoadingCriticos || isLoadingRecomendaciones;

  // Calcular estadísticas generales
  const stats = React.useMemo(() => {
    if (repuestosAnalytics.length === 0) return null;

    const totalItems = repuestosAnalytics.length;
    const itemsCriticos = repuestosAnalytics.filter(r => r.nivel_criticidad === 'critico' || r.nivel_criticidad === 'alto').length;
    const tendenciaCreciente = repuestosAnalytics.filter(r => r.tendencia_consumo === 'creciente').length;
    const conPatronEstacional = repuestosAnalytics.filter(r => r.patron_estacional).length;
    const confiabilidadPromedio = repuestosAnalytics.reduce((sum, r) => sum + r.confiabilidad_prediccion, 0) / totalItems;

    return {
      totalItems,
      itemsCriticos,
      tendenciaCreciente,
      conPatronEstacional,
      confiabilidadPromedio: Math.round(confiabilidadPromedio),
      porcentajeCriticos: Math.round((itemsCriticos / totalItems) * 100)
    };
  }, [repuestosAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-400">Cargando analytics de IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics con IA</h1>
              <p className="text-gray-400 mt-1">Predicciones inteligentes y optimización de stock</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de timeframe */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {[
              { value: '30', label: '30d' },
              { value: '60', label: '60d' },
              { value: '90', label: '90d' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={selectedTimeframe === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeframe(value as '30' | '60' | '90')}
                className={selectedTimeframe === value ? 'bg-blue-600 text-white' : 'text-gray-400'}
              >
                {label}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Items Analizados</p>
                <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Items Críticos</p>
                <p className="text-2xl font-bold text-red-400">{stats.itemsCriticos}</p>
                <p className="text-xs text-gray-500">{stats.porcentajeCriticos}% del total</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tendencia Creciente</p>
                <p className="text-2xl font-bold text-green-400">{stats.tendenciaCreciente}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confiabilidad IA</p>
                <p className="text-2xl font-bold text-blue-400">{stats.confiabilidadPromedio}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Cards principales */}
      <AnalyticsCards repuestosAnalytics={repuestosAnalytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de predicción de stock */}
        <StockPredictionChart 
          data={repuestosAnalytics} 
          timeframe={selectedTimeframe} 
        />

        {/* Recomendaciones de compra */}
        <PurchaseRecommendations 
          recomendaciones={recomendacionesCompra}
          isLoading={isLoadingRecomendaciones}
        />
      </div>

      {/* Tabla de items críticos */}
      <CriticalItemsTable 
        repuestosCriticos={repuestosCriticos}
        isLoading={isLoadingCriticos}
      />
    </div>
  );
};

export { AnalyticsDashboard };
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ordenesTrabajoApi, maquinasApi } from '../../api';
import { 
  BarChart3, 
  Clock, 
  Wrench, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar
} from 'lucide-react';
import { TIPOS_MANTENIMIENTO, ESTADOS_ORDEN_TRABAJO } from '../../types/orden-trabajo';
import type { OrdenTrabajo } from '../../types';

const MetricasDashboard: React.FC = () => {
  // Cargar datos
  const { data: ordenes = [], isLoading: isLoadingOT } = useQuery({
    queryKey: ['ordenes-trabajo'],
    queryFn: () => ordenesTrabajoApi.getAll(),
  });

  const { data: maquinas = [], isLoading: isLoadingMaquinas } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  const isLoading = isLoadingOT || isLoadingMaquinas;

  // Calcular métricas MTBF/MTTR
  const calcularMetricas = () => {
    if (!ordenes.length || !maquinas.length) return null;

    const ahora = new Date();
    const ordenesCompletadas = ordenes.filter(ot => ot.estado === 'completada');
    
    // Agrupar órdenes por máquina
    const ordenesPorMaquina = maquinas.map(maquina => ({
      maquina,
      ordenes: ordenes.filter(ot => ot.maquina_id === maquina.id),
      ordenesCompletadas: ordenesCompletadas.filter(ot => ot.maquina_id === maquina.id)
    }));

    // Calcular MTBF y MTTR por máquina
    const metricasPorMaquina = ordenesPorMaquina.map(({ maquina, ordenes, ordenesCompletadas }) => {
      let mtbf = 0; // Mean Time Between Failures
      let mttr = 0; // Mean Time To Repair

      if (ordenesCompletadas.length > 0) {
        // MTTR: Tiempo promedio desde que se crea la OT hasta que se completa
        const tiemposReparacion = ordenesCompletadas.map(ot => {
          const inicio = new Date(ot.fecha_creacion);
          const fin = new Date(ot.fecha_finalizacion || ot.fecha_creacion);
          return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60); // en horas
        });
        
        mttr = tiemposReparacion.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposReparacion.length;

        // MTBF: Tiempo promedio entre fallos (entre completar una OT y crear la siguiente)
        if (ordenesCompletadas.length > 1) {
          const tiemposEntreFallos = [];
          const ordenesOrdenadas = ordenesCompletadas.sort((a, b) => 
            new Date(a.fecha_finalizacion || a.fecha_creacion).getTime() - 
            new Date(b.fecha_finalizacion || b.fecha_creacion).getTime()
          );
          
          for (let i = 1; i < ordenesOrdenadas.length; i++) {
            const anterior = new Date(ordenesOrdenadas[i-1].fecha_finalizacion || ordenesOrdenadas[i-1].fecha_creacion);
            const actual = new Date(ordenesOrdenadas[i].fecha_creacion);
            const tiempoEntreFallos = (actual.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24); // en días
            tiemposEntreFallos.push(tiempoEntreFallos);
          }
          
          if (tiemposEntreFallos.length > 0) {
            mtbf = tiemposEntreFallos.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposEntreFallos.length;
          }
        }
      }

      return {
        maquina,
        mtbf: Math.round(mtbf * 100) / 100, // días
        mttr: Math.round(mttr * 100) / 100, // horas
        totalOrdenes: ordenes.length,
        ordenesCompletadas: ordenesCompletadas.length,
        ordenesPendientes: ordenes.filter(ot => ot.estado === 'pendiente').length,
        ordenesEnProceso: ordenes.filter(ot => ot.estado === 'en_proceso').length
      };
    });

    // Calcular métricas globales
    const mtbfPromedio = metricasPorMaquina.length > 0 ? 
      metricasPorMaquina.reduce((sum, m) => sum + m.mtbf, 0) / metricasPorMaquina.length : 0;
    
    const mttrPromedio = metricasPorMaquina.length > 0 ? 
      metricasPorMaquina.reduce((sum, m) => sum + m.mttr, 0) / metricasPorMaquina.length : 0;

    return {
      metricasPorMaquina,
      mtbfPromedio: Math.round(mtbfPromedio * 100) / 100,
      mttrPromedio: Math.round(mttrPromedio * 100) / 100
    };
  };

  // Calcular estadísticas por tipo de mantenimiento
  const calcularEstadisticasPorTipo = () => {
    const estadisticas = TIPOS_MANTENIMIENTO.map(tipo => ({
      ...tipo,
      total: ordenes.filter(ot => ot.tipo_mantenimiento === tipo.value).length,
      completadas: ordenes.filter(ot => ot.tipo_mantenimiento === tipo.value && ot.estado === 'completada').length,
      pendientes: ordenes.filter(ot => ot.tipo_mantenimiento === tipo.value && ot.estado === 'pendiente').length,
      enProceso: ordenes.filter(ot => ot.tipo_mantenimiento === tipo.value && ot.estado === 'en_proceso').length
    }));

    return estadisticas;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-400">Cargando métricas...</span>
      </div>
    );
  }

  const metricas = calcularMetricas();
  const estadisticasPorTipo = calcularEstadisticasPorTipo();
  const totalOrdenes = ordenes.length;
  const ordenesEsteMes = ordenes.filter(ot => {
    const fecha = new Date(ot.fecha_creacion);
    const ahora = new Date();
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard MTBF/MTTR</h1>
          <p className="text-gray-400 mt-1">Métricas de mantenimiento y confiabilidad</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Actualizado: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">MTBF Promedio</p>
                <p className="text-3xl font-bold text-white">
                  {metricas?.mtbfPromedio || 0}
                </p>
                <p className="text-blue-100 text-xs">días entre fallos</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">MTTR Promedio</p>
                <p className="text-3xl font-bold text-white">
                  {metricas?.mttrPromedio || 0}
                </p>
                <p className="text-orange-100 text-xs">horas de reparación</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total OTs</p>
                <p className="text-3xl font-bold text-white">{totalOrdenes}</p>
                <p className="text-green-100 text-xs">órdenes registradas</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Este Mes</p>
                <p className="text-3xl font-bold text-white">{ordenesEsteMes}</p>
                <p className="text-purple-100 text-xs">nuevas órdenes</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Estadísticas por tipo de mantenimiento */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Distribución por Tipo de Mantenimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estadisticasPorTipo.map(tipo => (
              <div key={tipo.value} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{tipo.icon}</span>
                    <h3 className="font-medium text-white">{tipo.label}</h3>
                  </div>
                  <Badge className={`${tipo.color} text-white`}>
                    {tipo.total}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completadas:</span>
                    <span className="text-green-400 font-medium">{tipo.completadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">En Proceso:</span>
                    <span className="text-blue-400 font-medium">{tipo.enProceso}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pendientes:</span>
                    <span className="text-yellow-400 font-medium">{tipo.pendientes}</span>
                  </div>
                </div>
                {tipo.total > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-gray-400">
                      Efectividad: {Math.round((tipo.completadas / tipo.total) * 100)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Métricas por máquina */}
      {metricas && metricas.metricasPorMaquina.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Métricas por Máquina
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Máquina</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">MTBF (días)</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">MTTR (horas)</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Total OTs</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Completadas</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.metricasPorMaquina.map(({ maquina, mtbf, mttr, totalOrdenes, ordenesCompletadas, ordenesPendientes, ordenesEnProceso }) => (
                    <tr key={maquina.id} className="border-b border-gray-800 hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white font-mono">{maquina.numero_serie}</div>
                          {maquina.alias && <div className="text-xs text-gray-400">({maquina.alias})</div>}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-white font-medium">
                        {mtbf > 0 ? mtbf : '-'}
                      </td>
                      <td className="text-right py-3 px-4 text-white font-medium">
                        {mttr > 0 ? mttr : '-'}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-300">{totalOrdenes}</td>
                      <td className="text-right py-3 px-4 text-green-400">{ordenesCompletadas}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex justify-end space-x-1">
                          {ordenesPendientes > 0 && (
                            <Badge className="bg-yellow-500 text-white text-xs">
                              {ordenesPendientes}P
                            </Badge>
                          )}
                          {ordenesEnProceso > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {ordenesEnProceso}EP
                            </Badge>
                          )}
                          {ordenesPendientes === 0 && ordenesEnProceso === 0 && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Información sobre las métricas */}
      <Card className="bg-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
            Información sobre las Métricas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-white mb-2">MTBF (Mean Time Between Failures)</h3>
              <p className="text-gray-300 leading-relaxed">
                Tiempo promedio entre fallos. Indica la confiabilidad de la máquina. 
                Se calcula como el tiempo promedio entre el final de una reparación y el inicio del siguiente fallo.
                Un MTBF más alto indica mayor confiabilidad.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">MTTR (Mean Time To Repair)</h3>
              <p className="text-gray-300 leading-relaxed">
                Tiempo promedio de reparación. Indica la mantenibilidad del equipo.
                Se calcula desde la creación de la OT hasta su completación.
                Un MTTR más bajo indica mejor capacidad de reparación.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { MetricasDashboard };
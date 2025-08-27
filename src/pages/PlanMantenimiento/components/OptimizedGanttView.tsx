import React, { useMemo } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import { TIPOS_MANTENIMIENTO } from '../../../types/orden-trabajo';
import { VirtualizedList } from './VirtualizedList';
import type { OrdenTrabajo, Maquina } from '../../../types';

interface OptimizedGanttViewProps {
  maquinas: Maquina[];
  ordenes: OrdenTrabajo[];
  usuarios: Array<{ id: number; username: string; nombre_completo?: string }>;
  currentDate: Date;
  onNewOT: (maquina?: Maquina, fecha?: Date) => void;
  onShowDetalle: (orden: OrdenTrabajo) => void;
}

// Generar días para el mes actual (memoized)
const getDaysInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    days.push(new Date(date));
  }
  
  return days;
};

const formatDay = (date: Date) => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  return {
    dayNumber: date.getDate(),
    dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
    isToday,
    isWeekend: date.getDay() === 0 || date.getDay() === 6
  };
};

export const OptimizedGanttView: React.FC<OptimizedGanttViewProps> = ({
  maquinas,
  ordenes,
  usuarios,
  currentDate,
  onNewOT,
  onShowDetalle
}) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Memoizar días del mes
  const days = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  // Memoizar órdenes del mes
  const ordenesDelMes = useMemo(() => {
    return ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      return fechaOrden.getMonth() === currentMonth && fechaOrden.getFullYear() === currentYear;
    });
  }, [ordenes, currentMonth, currentYear]);

  // Memoizar mapping de usuarios
  const usuarioMap = useMemo(() => {
    return new Map(usuarios.map(u => [u.id, u]));
  }, [usuarios]);

  // Memoizar órdenes por máquina
  const ordenesPorMaquina = useMemo(() => {
    const map = new Map<number, OrdenTrabajo[]>();
    ordenesDelMes.forEach(orden => {
      if (!map.has(orden.maquina_id)) {
        map.set(orden.maquina_id, []);
      }
      map.get(orden.maquina_id)!.push(orden);
    });
    return map;
  }, [ordenesDelMes]);

  // Calcular posición y ancho de la barra de Gantt
  const calculateGanttBar = (orden: OrdenTrabajo) => {
    const fechaOrden = new Date(orden.fecha_programada);
    const dayIndex = fechaOrden.getDate() - 1;
    
    const duracionDias = orden.tiempo_estimado_horas ? Math.max(1, Math.ceil(orden.tiempo_estimado_horas / 8)) : 1;
    
    return {
      left: `${(dayIndex / days.length) * 100}%`,
      width: `${(duracionDias / days.length) * 100}%`,
      minWidth: `${Math.max(2, (duracionDias / days.length) * 100)}%`
    };
  };

  const getTipoColor = (tipo: string) => {
    const tipoData = TIPOS_MANTENIMIENTO.find(t => t.value === tipo);
    return tipoData?.color || 'bg-gray-600';
  };

  // Función para renderizar cada fila de máquina
  const renderMachineRow = (maquina: Maquina, index: number) => {
    const machineOrders = ordenesPorMaquina.get(maquina.id) || [];
    
    return (
      <div className="flex hover:bg-gray-750 border-b border-gray-700 h-full">
        {/* Información de la máquina */}
        <div className="w-48 p-2 border-r border-gray-700 bg-gray-800 flex flex-col justify-center shrink-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h4 
                className="font-semibold text-white font-mono text-xs truncate leading-tight"
                title={`${maquina.numero_serie}${maquina.alias ? ` (${maquina.alias})` : ''}`}
              >
                {maquina.numero_serie}
              </h4>
              {maquina.modelo && (
                <div 
                  className="text-xs text-gray-500 truncate leading-tight"
                  title={`${maquina.modelo.fabricante} ${maquina.modelo.modelo}`}
                >
                  {maquina.modelo.fabricante}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNewOT(maquina)}
              title="Agregar mantenimiento"
              className="p-0.5 h-4 w-4 shrink-0"
            >
              <Plus className="w-2.5 h-2.5" />
            </Button>
          </div>
        </div>

        {/* Área de Gantt */}
        <div className="flex-1 relative p-2">
          {/* Grid de fondo */}
          <div className="absolute inset-0 flex">
            {days.map((day, dayIndex) => {
              const dayInfo = formatDay(day);
              return (
                <div 
                  key={dayIndex}
                  className={`flex-1 border-r border-gray-700 ${
                    dayInfo.isWeekend ? 'bg-gray-800' : ''
                  } ${dayInfo.isToday ? 'bg-blue-900/20' : ''}`}
                  onClick={() => onNewOT(maquina, day)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </div>

          {/* Barras de órdenes de trabajo */}
          <div className="relative z-10 space-y-1 py-1">
            {machineOrders.map((orden, orderIndex) => {
              const usuario = usuarioMap.get(orden.usuario_asignado_id);
              const barStyle = calculateGanttBar(orden);
              const tipoColor = getTipoColor(orden.tipo_mantenimiento);
              
              return (
                <div
                  key={orden.id}
                  className={`absolute h-6 rounded px-2 text-xs text-white cursor-pointer hover:brightness-110 transition-all ${tipoColor} shadow-sm`}
                  style={{
                    left: barStyle.left,
                    width: barStyle.width,
                    minWidth: barStyle.minWidth,
                    top: `${orderIndex * 28 + 4}px`
                  }}
                  onClick={() => onShowDetalle(orden)}
                  title={`${orden.titulo} - ${usuario?.nombre_completo || 'Sin asignar'}`}
                >
                  <div className="flex items-center justify-between h-full overflow-hidden">
                    <span className="truncate flex-1 font-medium">
                      {orden.titulo}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge 
                        size="xs"
                        className={`${
                          orden.estado === 'completada' ? 'bg-green-600' :
                          orden.estado === 'en_proceso' ? 'bg-blue-600' :
                          orden.estado === 'pendiente' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        } px-1`}
                      >
                        {orden.estado === 'completada' ? '✓' :
                         orden.estado === 'en_proceso' ? '⚡' :
                         orden.estado === 'pendiente' ? '⏳' : '?'}
                      </Badge>
                      {orden.tiempo_estimado_horas && (
                        <span className="text-xs opacity-75">
                          {orden.tiempo_estimado_horas}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Línea de hoy */}
          {(() => {
            const today = new Date();
            if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
              const todayPosition = ((today.getDate() - 1) / days.length) * 100;
              return (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: `${todayPosition}%` }}
                />
              );
            }
            return null;
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header con días */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="flex">
          {/* Columna de máquinas */}
          <div className="w-48 p-2 border-r border-gray-700 bg-gray-800 shrink-0">
            <h3 className="font-semibold text-white text-xs">Máquinas ({maquinas.length})</h3>
          </div>
          
          {/* Columnas de días */}
          <div className="flex-1 flex min-w-0">
            {days.map((day, index) => {
              const dayInfo = formatDay(day);
              return (
                <div 
                  key={index}
                  className={`flex-1 p-1 text-center border-r border-gray-700 min-w-[28px] ${
                    dayInfo.isToday ? 'bg-blue-900' : ''
                  } ${dayInfo.isWeekend ? 'bg-gray-750' : ''}`}
                >
                  <div className={`text-xs leading-tight ${dayInfo.isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                    {dayInfo.dayName.substring(0, 2)}
                  </div>
                  <div className={`font-medium text-xs leading-tight ${
                    dayInfo.isToday ? 'text-blue-400 font-bold' : 
                    dayInfo.isWeekend ? 'text-gray-500' : 'text-white'
                  }`}>
                    {dayInfo.dayNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista virtualizada de máquinas */}
      <VirtualizedList
        items={maquinas}
        itemHeight={80}
        containerHeight={600}
        renderItem={renderMachineRow}
        overscan={5}
      />
    </div>
  );
};
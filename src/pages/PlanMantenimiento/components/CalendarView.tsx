import React, { useMemo } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { TIPOS_MANTENIMIENTO } from '../../../types/orden-trabajo';
import type { OrdenTrabajo, Maquina } from '../../../types';

interface CalendarViewProps {
  maquinas: Maquina[];
  ordenes: OrdenTrabajo[];
  usuarios: Array<{ id: number; username: string; nombre_completo?: string }>;
  currentDate: Date;
  onNewOT: (maquina?: Maquina, fecha?: Date) => void;
  onShowDetalle: (orden: OrdenTrabajo) => void;
  onDateChange: (date: Date) => void;
}

// Generar días del calendario (incluyendo días del mes anterior/siguiente para completar semanas)
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  // Retroceder al lunes anterior
  const dayOfWeek = startDate.getDay();
  if (dayOfWeek !== 1) {
    startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  }
  
  // Avanzar al domingo siguiente
  const lastDayOfWeek = endDate.getDay();
  if (lastDayOfWeek !== 0) {
    endDate.setDate(endDate.getDate() + (7 - lastDayOfWeek));
  }
  
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// Agrupar días en semanas
const groupByWeeks = (days: any[]) => {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  maquinas,
  ordenes,
  usuarios,
  currentDate,
  onNewOT,
  onShowDetalle,
  onDateChange
}) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generar días del calendario
  const calendarDays = useMemo(() => 
    getCalendarDays(currentYear, currentMonth), 
    [currentYear, currentMonth]
  );

  // Agrupar en semanas
  const weeks = useMemo(() => groupByWeeks(calendarDays), [calendarDays]);

  // Filtrar órdenes del período visible
  const ordenesDelPeriodo = useMemo(() => {
    const startDate = calendarDays[0]?.date;
    const endDate = calendarDays[calendarDays.length - 1]?.date;
    
    return ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      return fechaOrden >= startDate && fechaOrden <= endDate;
    });
  }, [ordenes, calendarDays]);

  // Memoizar mapping de usuarios
  const usuarioMap = useMemo(() => {
    return new Map(usuarios.map(u => [u.id, u]));
  }, [usuarios]);

  // Obtener órdenes para un día específico
  const getOrdersForDay = (date: Date) => {
    return ordenesDelPeriodo.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      return fechaOrden.toDateString() === date.toDateString();
    });
  };

  // Navegación de mes
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Obtener badge de tipo de mantenimiento
  const getTipoMantenimientoBadge = (tipo: string) => {
    const tipoData = TIPOS_MANTENIMIENTO.find(t => t.value === tipo);
    if (!tipoData) return null;
    
    return (
      <div 
        className={`w-2 h-2 rounded-full ${tipoData.color}`}
        title={tipoData.label}
      />
    );
  };

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
    .format(currentDate);

  return (
    <div className="space-y-4">
      {/* Header de navegación */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold text-white capitalize">
            {monthName}
          </h2>
          
          <div className="text-sm text-gray-400">
            {ordenesDelPeriodo.length} mantenimientos programados
          </div>
        </div>
      </Card>

      {/* Calendario */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gray-900">
          {/* Header de días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-700">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
              <div 
                key={day}
                className={`p-4 text-center font-semibold text-sm border-r border-gray-700 last:border-r-0 ${
                  index >= 5 ? 'bg-gray-800 text-gray-400' : 'bg-gray-750 text-white'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-700 last:border-b-0">
              {week.map((day, dayIndex) => {
                const dayOrders = getOrdersForDay(day.date);
                const hasOrders = dayOrders.length > 0;
                
                return (
                  <div 
                    key={dayIndex}
                    className={`min-h-[120px] border-r border-gray-700 last:border-r-0 p-2 relative cursor-pointer hover:bg-gray-750 transition-colors ${
                      !day.isCurrentMonth ? 'bg-gray-800' : ''
                    } ${day.isWeekend ? 'bg-gray-800/50' : ''} ${
                      day.isToday ? 'bg-blue-900/30' : ''
                    }`}
                    onClick={() => onNewOT(undefined, day.date)}
                    title={day.isCurrentMonth ? 'Click para agregar mantenimiento' : ''}
                  >
                    {/* Número del día */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        day.isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' :
                        !day.isCurrentMonth ? 'text-gray-600' :
                        day.isWeekend ? 'text-gray-400' : 'text-white'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      
                      {/* Indicador de cantidad de órdenes */}
                      {hasOrders && (
                        <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {dayOrders.length}
                        </span>
                      )}
                    </div>

                    {/* Lista de órdenes */}
                    <div className="space-y-1">
                      {dayOrders.slice(0, 3).map((orden) => {
                        const usuario = usuarioMap.get(orden.usuario_asignado_id);
                        const maquina = maquinas.find(m => m.id === orden.maquina_id);
                        
                        return (
                          <div
                            key={orden.id}
                            className="bg-gray-700 rounded-sm p-1.5 text-xs cursor-pointer hover:bg-gray-600 transition-colors border-l-2 border-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onShowDetalle(orden);
                            }}
                            title={`${orden.titulo} - ${maquina?.numero_serie} - ${usuario?.nombre_completo || 'Sin asignar'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {getTipoMantenimientoBadge(orden.tipo_mantenimiento)}
                              <span className="font-medium text-white text-xs truncate flex-1">
                                {maquina?.numero_serie}
                              </span>
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
                            </div>
                            <div className="text-gray-300 text-xs truncate">
                              {orden.titulo}
                            </div>
                            {usuario && (
                              <div className="text-gray-400 text-xs truncate">
                                {usuario.nombre_completo || usuario.username}
                              </div>
                            )}
                            {orden.tiempo_estimado_horas && (
                              <div className="text-gray-500 text-xs">
                                {orden.tiempo_estimado_horas}h
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Indicador de más órdenes */}
                      {dayOrders.length > 3 && (
                        <div className="text-xs text-gray-400 text-center py-1">
                          +{dayOrders.length - 3} más
                        </div>
                      )}
                      
                      {/* Placeholder para agregar nuevos mantenimientos */}
                      {dayOrders.length === 0 && day.isCurrentMonth && (
                        <div className="w-full h-6 border border-dashed border-gray-600 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Línea de hoy */}
                    {day.isToday && (
                      <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Resumen del mes */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {ordenesDelPeriodo.length}
            </div>
            <div className="text-sm text-gray-400">Total OTs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {ordenesDelPeriodo.filter(o => o.estado === 'completada').length}
            </div>
            <div className="text-sm text-gray-400">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {ordenesDelPeriodo.filter(o => o.estado === 'pendiente').length}
            </div>
            <div className="text-sm text-gray-400">Pendientes</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
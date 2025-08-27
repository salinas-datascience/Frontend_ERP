import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Plus, Calendar } from 'lucide-react';
import { TIPOS_MANTENIMIENTO } from '../../../types/orden-trabajo';
import type { OrdenTrabajo, Maquina } from '../../../types';

interface TableViewProps {
  maquinas: Maquina[];
  ordenes: OrdenTrabajo[];
  usuarios: Array<{ id: number; username: string; nombre_completo?: string }>;
  currentDate: Date;
  onNewOT: (maquina?: Maquina, fecha?: Date) => void;
  onShowDetalle: (orden: OrdenTrabajo) => void;
}

// Obtener las semanas del mes pero con días exactos
const getWeeksWithDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  
  let currentWeekStart = new Date(firstDay);
  // Retroceder al lunes anterior si es necesario
  const dayOfWeek = currentWeekStart.getDay();
  if (dayOfWeek !== 1) {
    currentWeekStart.setDate(currentWeekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  }
  
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const days = [];
    for (let d = new Date(currentWeekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd),
      days,
      label: `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
    });
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
};

export const TableView: React.FC<TableViewProps> = ({
  maquinas,
  ordenes,
  usuarios,
  currentDate,
  onNewOT,
  onShowDetalle
}) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const weeks = getWeeksWithDays(currentYear, currentMonth);

  // Filtrar órdenes del mes actual
  const ordenesDelMes = ordenes.filter(orden => {
    const fechaOrden = new Date(orden.fecha_programada);
    return fechaOrden.getMonth() === currentMonth && fechaOrden.getFullYear() === currentYear;
  });

  // Obtener órdenes para una máquina y día específico
  const getOrdersForMachineAndDay = (maquinaId: number, date: Date) => {
    return ordenesDelMes.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      return orden.maquina_id === maquinaId && 
             fechaOrden.toDateString() === date.toDateString();
    });
  };

  const getTipoMantenimientoBadge = (tipo: string) => {
    const tipoData = TIPOS_MANTENIMIENTO.find(t => t.value === tipo);
    if (!tipoData) return <Badge size="xs">{tipo}</Badge>;
    
    return (
      <Badge className={`${tipoData.color} text-white`} size="xs">
        <span className="mr-1">{tipoData.icon}</span>
        {tipoData.label.substring(0, 4)}
      </Badge>
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header con días */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="grid grid-cols-[280px_repeat(7,1fr)]">
          <div className="p-3 border-r border-gray-700 bg-gray-800">
            <h3 className="font-semibold text-white">Máquinas</h3>
          </div>
          
          {/* Días de la semana */}
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
            <div 
              key={index}
              className={`p-2 text-center border-r border-gray-700 ${
                index >= 5 ? 'bg-gray-750' : ''
              }`}
            >
              <div className="text-sm font-medium text-white">{day}</div>
            </div>
          ))}
        </div>
        
        {/* Header de fechas por semana */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-[280px_repeat(7,1fr)] border-b border-gray-600">
            <div className="p-2 border-r border-gray-700 bg-gray-800">
              <div className="text-xs text-gray-400">Semana {weekIndex + 1}</div>
              <div className="text-xs text-gray-500">{week.label}</div>
            </div>
            
            {week.days.map((day, dayIndex) => {
              const dayInCurrentMonth = day.getMonth() === currentMonth;
              return (
                <div 
                  key={dayIndex}
                  className={`p-1 text-center border-r border-gray-700 ${
                    isToday(day) ? 'bg-blue-900' :
                    !dayInCurrentMonth ? 'bg-gray-800' :
                    isWeekend(day) ? 'bg-gray-750' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday(day) ? 'text-blue-400' :
                    !dayInCurrentMonth ? 'text-gray-600' :
                    isWeekend(day) ? 'text-gray-400' : 'text-white'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Filas de máquinas */}
      <div className="max-h-[500px] overflow-y-auto">
        {maquinas.map((maquina) => (
          <div key={maquina.id}>
            {weeks.map((week, weekIndex) => (
              <div 
                key={`${maquina.id}-${weekIndex}`}
                className="grid grid-cols-[280px_repeat(7,1fr)] hover:bg-gray-750 border-b border-gray-700 min-h-[100px]"
              >
                {/* Información de máquina (solo en la primera semana) */}
                {weekIndex === 0 && (
                  <div 
                    className="p-3 border-r border-gray-700 bg-gray-800 flex flex-col justify-between"
                    style={{ gridRow: `1 / ${weeks.length + 1}` }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white font-mono text-sm">{maquina.numero_serie}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNewOT(maquina)}
                          title="Agregar mantenimiento"
                          className="p-1 h-6 w-6"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {maquina.alias && (
                        <span className="text-xs text-gray-400 block mb-1">({maquina.alias})</span>
                      )}
                      <div className="text-xs text-gray-500 mb-2">
                        {maquina.modelo?.fabricante} {maquina.modelo?.modelo}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Badge size="xs" className="bg-green-600 text-white">
                        Activa
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Celdas de días */}
                {week.days.map((day, dayIndex) => {
                  const dayOrders = getOrdersForMachineAndDay(maquina.id, day);
                  const dayInCurrentMonth = day.getMonth() === currentMonth;
                  
                  return (
                    <div 
                      key={dayIndex}
                      className={`p-2 border-r border-gray-700 min-h-[100px] cursor-pointer hover:bg-gray-600 transition-colors relative ${
                        isToday(day) ? 'bg-blue-900/30' :
                        !dayInCurrentMonth ? 'bg-gray-800' :
                        isWeekend(day) ? 'bg-gray-800/50' : ''
                      }`}
                      onClick={() => dayInCurrentMonth && onNewOT(maquina, day)}
                      title={dayInCurrentMonth ? 'Click para agregar mantenimiento' : ''}
                    >
                      {/* Indicator de día */}
                      <div className="text-xs text-gray-500 mb-1">
                        {day.getDate()}
                      </div>

                      {/* Órdenes de trabajo */}
                      <div className="space-y-1">
                        {dayOrders.map((orden) => {
                          const usuario = usuarios.find(u => u.id === orden.usuario_asignado_id);
                          return (
                            <div
                              key={orden.id}
                              className="bg-gray-700 rounded-sm p-1.5 text-xs border-l-2 border-blue-500 cursor-pointer hover:bg-gray-600 transition-colors"
                              title={`${orden.titulo} - ${usuario?.nombre_completo || 'Sin asignar'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowDetalle(orden);
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                {getTipoMantenimientoBadge(orden.tipo_mantenimiento)}
                              </div>
                              <div className="font-medium text-white text-xs truncate mb-1">
                                {orden.titulo}
                              </div>
                              {usuario && (
                                <div className="text-gray-400 text-xs truncate mb-1">
                                  {usuario.nombre_completo || usuario.username}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <Badge 
                                  size="xs"
                                  className={`${
                                    orden.estado === 'completada' ? 'bg-green-600' :
                                    orden.estado === 'en_proceso' ? 'bg-blue-600' :
                                    orden.estado === 'pendiente' ? 'bg-yellow-600' :
                                    'bg-gray-600'
                                  } px-1`}
                                >
                                  {orden.estado === 'completada' ? 'OK' :
                                   orden.estado === 'en_proceso' ? 'EP' :
                                   orden.estado === 'pendiente' ? 'P' : '?'}
                                </Badge>
                                {orden.tiempo_estimado_horas && (
                                  <span className="text-gray-400 text-xs">
                                    {orden.tiempo_estimado_horas}h
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Placeholder para agregar nuevos mantenimientos */}
                        {dayOrders.length === 0 && dayInCurrentMonth && (
                          <div className="w-full h-6 border border-dashed border-gray-600 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Línea de hoy */}
                      {isToday(day) && (
                        <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
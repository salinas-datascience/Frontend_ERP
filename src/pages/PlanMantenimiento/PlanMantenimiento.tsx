import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ordenesTrabajoApi, maquinasApi } from '../../api';
import { adminApi } from '../../api/admin';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { TIPOS_MANTENIMIENTO } from '../../types/orden-trabajo';
import type { OrdenTrabajo, Maquina } from '../../types';
import { NuevaOTModal } from './components/NuevaOTModal';
import { DetalleOTModal } from './components/DetalleOTModal';
import { ViewSelector, type ViewType } from './components/ViewSelector';
import { GanttView } from './components/GanttView';
import { TableView } from './components/TableView';
import { OptimizedGanttView } from './components/OptimizedGanttView';
import { CalendarView } from './components/CalendarView';
import { GroupingControls, type GroupingType } from './components/GroupingControls';
import { MachineFilters } from './components/MachineFilters';
import { useGroupedMachines } from './hooks/useGroupedMachines';
import { useMachineFilters } from './hooks/useMachineFilters';

// Función para obtener las semanas del mes
const getWeeksInMonth = (year: number, month: number) => {
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
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd),
      label: `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
    });
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
};

// Función para formatear fecha
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short'
  });
};

const PlanMantenimiento: React.FC = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [tipoFiltro, setTipoFiltro] = React.useState('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [showNewOTModal, setShowNewOTModal] = React.useState(false);
  const [selectedMaquina, setSelectedMaquina] = React.useState<Maquina | undefined>();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [showDetalleModal, setShowDetalleModal] = React.useState(false);
  const [selectedOrden, setSelectedOrden] = React.useState<OrdenTrabajo | undefined>();
  const [currentView, setCurrentView] = React.useState<ViewType>('gantt');
  const [groupBy, setGroupBy] = React.useState<GroupingType>('none');
  const [showCollapsed, setShowCollapsed] = React.useState(false);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Cargar datos
  const { data: maquinasRaw = [], isLoading: isLoadingMaquinas } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  // Aplicar filtros y ordenamiento a las máquinas
  const machineFilters = useMachineFilters({ machines: maquinasRaw });

  const { data: ordenes = [], isLoading: isLoadingOrdenes } = useQuery({
    queryKey: ['ordenes-trabajo'],
    queryFn: () => ordenesTrabajoApi.getAll(),
  });

  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => adminApi.getUsuarios(),
  });

  const isLoading = isLoadingMaquinas || isLoadingOrdenes || isLoadingUsuarios;

  // Usar máquinas filtradas
  const maquinas = machineFilters.filteredMachines;

  // Agrupar máquinas según la configuración
  const groupedMachines = useGroupedMachines(maquinas, groupBy);
  
  // Filtrar máquinas según grupos colapsados
  const visibleMachines = React.useMemo(() => {
    if (groupBy === 'none') return maquinas;
    
    return groupedMachines.reduce((acc, group) => {
      if (!collapsedGroups.has(group.group)) {
        acc.push(...group.machines);
      }
      return acc;
    }, [] as Maquina[]);
  }, [groupedMachines, collapsedGroups, maquinas, groupBy]);
  
  // Calcular semanas del mes actual
  const weeks = getWeeksInMonth(currentYear, currentMonth);

  // Filtrar órdenes por mes actual y tipo
  const ordenesDelMes = React.useMemo(() => {
    return ordenes.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      const mismoPeriodo = fechaOrden.getMonth() === currentMonth && 
                          fechaOrden.getFullYear() === currentYear;
      
      const coincidenTipo = tipoFiltro === 'all' || orden.tipo_mantenimiento === tipoFiltro;
      
      return mismoPeriodo && coincidenTipo;
    });
  }, [ordenes, currentMonth, currentYear, tipoFiltro]);

  // Agrupar órdenes por máquina y semana
  const getOrdersForMachineAndWeek = (maquinaId: number, weekStart: Date, weekEnd: Date) => {
    return ordenesDelMes.filter(orden => {
      const fechaOrden = new Date(orden.fecha_programada);
      return orden.maquina_id === maquinaId && 
             fechaOrden >= weekStart && 
             fechaOrden <= weekEnd;
    });
  };

  // Función para obtener el badge de tipo de mantenimiento
  const getTipoMantenimientoBadge = (tipo: string, size: 'sm' | 'xs' = 'xs') => {
    const tipoData = TIPOS_MANTENIMIENTO.find(t => t.value === tipo);
    if (!tipoData) return <Badge size={size}>{tipo}</Badge>;
    
    return (
      <Badge className={`${tipoData.color} text-white text-${size}`} size={size}>
        <span className="mr-1">{tipoData.icon}</span>
        {size === 'sm' ? tipoData.label : tipoData.label.substring(0, 3)}
      </Badge>
    );
  };

  // Funciones de navegación
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Función para abrir modal de nueva OT
  const handleNewOT = (maquina?: Maquina, fecha?: Date) => {
    setSelectedMaquina(maquina);
    setSelectedDate(fecha);
    setShowNewOTModal(true);
  };

  const handleCloseNewOTModal = () => {
    setShowNewOTModal(false);
    setSelectedMaquina(undefined);
    setSelectedDate(undefined);
  };

  const handleOTCreated = (fechaCreada: Date) => {
    // Navegar al mes donde se creó la OT si es diferente al actual
    const mesCreado = fechaCreada.getMonth();
    const yearCreado = fechaCreada.getFullYear();
    
    if (mesCreado !== currentMonth || yearCreado !== currentYear) {
      setCurrentDate(new Date(yearCreado, mesCreado, 1));
    }
  };

  // Función para abrir modal de detalle
  const handleShowDetalle = (orden: OrdenTrabajo) => {
    setSelectedOrden(orden);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedOrden(undefined);
  };
  
  // Funciones para manejo de grupos
  const handleToggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };
  
  const handleToggleAllGroups = () => {
    if (showCollapsed) {
      setCollapsedGroups(new Set(groupedMachines.map(g => g.group)));
    } else {
      setCollapsedGroups(new Set());
    }
    setShowCollapsed(!showCollapsed);
  };

  // Opciones de filtro
  const tipoOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...TIPOS_MANTENIMIENTO.map(tipo => ({ 
      value: tipo.value, 
      label: tipo.label 
    }))
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-400">Cargando plan de mantenimiento...</span>
      </div>
    );
  }

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
    .format(currentDate);

  // Renderizar vista según selección
  const renderCurrentView = () => {
    const commonProps = {
      maquinas: visibleMachines,
      ordenes: ordenesDelMes,
      usuarios,
      currentDate,
      onNewOT: handleNewOT,
      onShowDetalle: handleShowDetalle
    };

    switch (currentView) {
      case 'gantt':
        // Usar vista optimizada si hay muchas máquinas
        return visibleMachines.length > 50 ? 
          <OptimizedGanttView {...commonProps} /> : 
          <GanttView {...commonProps} />;
      case 'table':
        return <TableView {...commonProps} />;
      case 'timeline':
        return renderTimelineView();
      case 'calendar':
        return <CalendarView {...commonProps} onDateChange={setCurrentDate} />;
      default:
        return visibleMachines.length > 50 ? 
          <OptimizedGanttView {...commonProps} /> : 
          <GanttView {...commonProps} />;
    }
  };
  
  // Renderizar vista timeline original (simplificada)
  const renderTimelineView = () => {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header de semanas */}
            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(150px,1fr))] border-b border-gray-700">
              <div className="p-4 bg-gray-800 border-r border-gray-700">
                <h3 className="font-semibold text-white">Máquinas</h3>
              </div>
              {weeks.map((week, index) => (
                <div key={index} className="p-4 bg-gray-800 border-r border-gray-700 text-center">
                  <div className="text-sm font-medium text-white">Semana {index + 1}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(week.start)} - {formatDate(week.end)}
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de máquinas */}
            <div className="max-h-[600px] overflow-y-auto">
              {visibleMachines.map((maquina) => (
                <div 
                  key={maquina.id}
                  className={`grid grid-cols-[250px_repeat(${weeks.length},1fr)] border-b border-gray-700 hover:bg-gray-750`}
                >
                  {/* Columna de máquina */}
                  <div className="p-4 border-r border-gray-700 bg-gray-800">
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-white font-mono">{maquina.numero_serie}</h4>
                      {maquina.alias && (
                        <span className="text-xs text-gray-400">({maquina.alias})</span>
                      )}
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {maquina.modelo?.fabricante} {maquina.modelo?.modelo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columnas de semanas */}
                  {weeks.map((week, weekIndex) => {
                    const weekOrders = getOrdersForMachineAndWeek(maquina.id, week.start, week.end);
                    return (
                      <div 
                        key={weekIndex}
                        className="p-2 border-r border-gray-700 min-h-[100px] relative"
                      >
                        <div className="space-y-1">
                          {weekOrders.map((orden) => {
                            const usuario = usuarios.find(u => u.id === orden.usuario_asignado_id);
                            return (
                              <div
                                key={orden.id}
                                className="bg-gray-700 rounded p-2 text-xs border-l-2 border-blue-500 cursor-pointer hover:bg-gray-600 transition-colors"
                                title={`${orden.titulo} - ${usuario?.nombre_completo || 'Sin asignar'}`}
                                onClick={() => handleShowDetalle(orden)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  {getTipoMantenimientoBadge(orden.tipo_mantenimiento)}
                                  <span className="text-gray-400">
                                    {new Date(orden.fecha_programada).getDate()}
                                  </span>
                                </div>
                                <div className="font-medium text-white text-xs truncate">
                                  {orden.titulo}
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Placeholder para agregar nuevos mantenimientos */}
                          {weekOrders.length === 0 && (
                            <div 
                              className="w-full h-8 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                              title="Agregar mantenimiento"
                              onClick={() => handleNewOT(maquina, week.start)}
                            >
                              <Plus className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Plan de Mantenimiento</h1>
          <p className="text-gray-400 mt-1">Planificación visual de mantenimientos preventivos</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-600 text-white' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => handleNewOT()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva OT
          </Button>
        </div>
      </div>

      {/* Filtros de máquinas */}
      <MachineFilters
        searchTerm={machineFilters.searchTerm}
        onSearchChange={machineFilters.setSearchTerm}
        sortField={machineFilters.sortField}
        sortOrder={machineFilters.sortOrder}
        onSortChange={machineFilters.handleSortChange}
        activeFilter={machineFilters.activeFilter}
        onActiveFilterChange={machineFilters.setActiveFilter}
        ubicacionFilter={machineFilters.ubicacionFilter}
        onUbicacionFilterChange={machineFilters.setUbicacionFilter}
        availableUbicaciones={machineFilters.availableUbicaciones}
        onClearFilters={machineFilters.clearFilters}
      />

      {/* Selector de vistas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <ViewSelector 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        
        <GroupingControls
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          showCollapsed={showCollapsed}
          onToggleCollapsed={handleToggleAllGroups}
        />
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterSelect
              label="Tipo de Mantenimiento"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              options={tipoOptions}
            />
          </div>
        </Card>
      )}

      {/* Navigation - Solo mostrar si no es vista calendario */}
      {currentView !== 'calendar' && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <h2 className="text-xl font-semibold text-white capitalize">
              {monthName}
            </h2>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{ordenesDelMes.length} mantenimientos programados</span>
            </div>
          </div>
        </Card>
      )}

      {/* Grupos de máquinas */}
      {groupBy !== 'none' && (
        <div className="space-y-2">
          {groupedMachines.map((group) => (
            <Card key={group.group} className="p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleGroup(group.group)}
              >
                <h3 className="font-semibold text-white flex items-center">
                  {collapsedGroups.has(group.group) ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {group.group} ({group.count})
                </h3>
                <span className="text-sm text-gray-400">
                  {collapsedGroups.has(group.group) ? 'Expandir' : 'Colapsar'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Vista principal */}
      {renderCurrentView()}

      {/* Información y leyenda */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Vista: {currentView === 'gantt' ? 'Diagrama de Gantt' : currentView === 'table' ? 'Tabla' : currentView === 'timeline' ? 'Timeline Semanal' : 'Calendario'}</h3>
          <div className="text-sm text-gray-400">
            Mostrando {visibleMachines.length} de {machineFilters.totalMachines} máquinas • {ordenesDelMes.length} OTs este mes
            {machineFilters.filteredCount !== machineFilters.totalMachines && (
              <span className="text-blue-400 ml-2">({machineFilters.filteredCount} después de filtros)</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {TIPOS_MANTENIMIENTO.map(tipo => (
                <div key={tipo.value}>
                  {getTipoMantenimientoBadge(tipo.value, 'sm')}
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-sm">Tipos de mantenimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Badge size="sm" className="bg-green-600">✓</Badge>
              <Badge size="sm" className="bg-blue-600">⚡</Badge>
              <Badge size="sm" className="bg-yellow-600">⏳</Badge>
            </div>
            <span className="text-gray-400 text-sm">Estados (Completada, En Proceso, Pendiente)</span>
          </div>
          {currentView === 'gantt' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-red-500 rounded"></div>
              <span className="text-gray-400 text-sm">Línea de hoy</span>
            </div>
          )}
        </div>
      </Card>

      {/* Modal para nueva OT */}
      <NuevaOTModal
        isOpen={showNewOTModal}
        onClose={handleCloseNewOTModal}
        maquina={selectedMaquina}
        fechaSugerida={selectedDate}
        usuarios={usuarios}
        onOTCreated={handleOTCreated}
      />

      {/* Modal para detalle de OT */}
      <DetalleOTModal
        isOpen={showDetalleModal}
        onClose={handleCloseDetalleModal}
        orden={selectedOrden}
        usuario={selectedOrden ? usuarios.find(u => u.id === selectedOrden.usuario_asignado_id) : undefined}
      />
    </div>
  );
};

export { PlanMantenimiento };
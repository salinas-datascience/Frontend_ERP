import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { ordenesTrabajoApi, maquinasApi } from '../../api';
import { Plus, Edit, Trash2, Eye, Filter, X, Users, Calendar, AlertTriangle } from 'lucide-react';
import type { OrdenTrabajo, OrdenTrabajoFilters } from '../../types';

const OrdenesTrabajoList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState('all');
  const [criticidadFilter, setCriticidadFilter] = React.useState('all');
  const [maquinaFilter, setMaquinaFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: ordenes = [], isLoading, error } = useQuery({
    queryKey: ['ordenes-trabajo'],
    queryFn: () => ordenesTrabajoApi.getAll(),
  });

  const { data: maquinas = [] } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['ordenes-trabajo-stats'],
    queryFn: ordenesTrabajoApi.getStats,
  });

  const deleteMutation = useMutation({
    mutationFn: ordenesTrabajoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo-stats'] });
    },
  });

  const filteredOrdenes = React.useMemo(() => {
    return ordenes.filter((orden) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        orden.titulo.toLowerCase().includes(searchLower) ||
        (orden.descripcion?.toLowerCase().includes(searchLower)) ||
        orden.maquina.numero_serie.toLowerCase().includes(searchLower) ||
        (orden.maquina.alias?.toLowerCase().includes(searchLower)) ||
        orden.usuario_asignado.nombre_completo?.toLowerCase().includes(searchLower) ||
        orden.usuario_asignado.username.toLowerCase().includes(searchLower);

      const matchesEstado = estadoFilter === 'all' || orden.estado === estadoFilter;
      const matchesCriticidad = criticidadFilter === 'all' || orden.nivel_criticidad === criticidadFilter;
      const matchesMaquina = maquinaFilter === 'all' || orden.maquina_id.toString() === maquinaFilter;

      return matchesSearch && matchesEstado && matchesCriticidad && matchesMaquina;
    });
  }, [ordenes, search, estadoFilter, criticidadFilter, maquinaFilter]);

  const totalItems = filteredOrdenes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentOrdenes = filteredOrdenes.slice(startIndex, endIndex);

  const hasActiveFilters = search !== '' || estadoFilter !== 'all' || criticidadFilter !== 'all' || maquinaFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('all');
    setCriticidadFilter('all');
    setMaquinaFilter('all');
    setPage(1);
  };

  const handleDelete = (id: number, titulo: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la orden de trabajo "${titulo}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [search, estadoFilter, criticidadFilter, maquinaFilter]);

  const getEstadoBadge = (estado: string) => {
    const colors = {
      'pendiente': 'bg-yellow-500',
      'en_proceso': 'bg-blue-500',
      'completada': 'bg-green-500',
      'cancelada': 'bg-red-500'
    };
    
    const labels = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };

    return (
      <Badge className={`${colors[estado as keyof typeof colors]} text-white`}>
        {labels[estado as keyof typeof labels]}
      </Badge>
    );
  };

  const getCriticidadBadge = (criticidad: string) => {
    const colors = {
      'baja': 'bg-gray-500',
      'media': 'bg-yellow-500',
      'alta': 'bg-orange-500',
      'critica': 'bg-red-500'
    };
    
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    };

    return (
      <Badge className={`${colors[criticidad as keyof typeof colors]} text-white`}>
        {labels[criticidad as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando órdenes de trabajo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar las órdenes de trabajo</div>
      </div>
    );
  }

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const criticidadOptions = [
    { value: 'all', label: 'Todas las criticidades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  const maquinaOptions = [
    { value: 'all', label: 'Todas las máquinas' },
    ...maquinas.map(m => ({ 
      value: m.id.toString(), 
      label: `${m.numero_serie}${m.alias ? ` (${m.alias})` : ''}` 
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Generar OT</h1>
        <Link to="/ordenes-trabajo/nuevo">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden de Trabajo
          </Button>
        </Link>
      </div>

      {/* Dashboard de estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total OTs</p>
                <p className="text-2xl font-bold text-white">{stats.total_general}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En Proceso</p>
                <p className="text-2xl font-bold text-white">{stats.total_en_proceso}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-white">{stats.total_pendiente}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vencidas</p>
                <p className="text-2xl font-bold text-white">{stats.total_vencidas}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por título, descripción, máquina o técnico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                showClearButton={search.length > 0}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <FilterSelect
                label="Estado"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                options={estadoOptions}
              />
              
              <FilterSelect
                label="Criticidad"
                value={criticidadFilter}
                onChange={(e) => setCriticidadFilter(e.target.value)}
                options={criticidadOptions}
              />

              <FilterSelect
                label="Máquina"
                value={maquinaFilter}
                onChange={(e) => setMaquinaFilter(e.target.value)}
                options={maquinaOptions}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>
                {totalItems} orden{totalItems !== 1 ? 'es' : ''} de trabajo encontrada{totalItems !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtrado)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes de trabajo */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Técnico Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Criticidad</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrdenes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron órdenes de trabajo con los filtros aplicados'
                      : 'No hay órdenes de trabajo registradas'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                currentOrdenes.map((orden) => (
                  <TableRow key={orden.id}>
                    <TableCell className="font-medium">{orden.titulo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{orden.maquina.numero_serie}</span>
                        {orden.maquina.alias && (
                          <span className="text-gray-400 text-xs">({orden.maquina.alias})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {orden.usuario_asignado.nombre_completo || orden.usuario_asignado.username}
                    </TableCell>
                    <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                    <TableCell>{getCriticidadBadge(orden.nivel_criticidad)}</TableCell>
                    <TableCell>
                      {new Date(orden.fecha_programada).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/ordenes-trabajo/${orden.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/ordenes-trabajo/${orden.id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(orden.id, orden.titulo)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-700 px-6 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenesTrabajoList;
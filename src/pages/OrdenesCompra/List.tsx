import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  X, 
  FileText, 
  Calendar,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';

import { ordenesCompraApi, proveedoresApi } from '../../api';
import type { 
  OrdenCompra, 
  EstadoOrden, 
  EstadisticasOrdenes,
  ESTADO_LABELS,
  ESTADO_COLORS 
} from '../../types';

// Componente de estadísticas
const EstadisticasCard: React.FC<{ estadisticas: EstadisticasOrdenes }> = ({ estadisticas }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className="p-2 bg-blue-900/50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-400">Total</p>
          <p className="text-2xl font-semibold text-white">{estadisticas.total}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className="p-2 bg-gray-700 rounded-lg">
          <Edit className="h-5 w-5 text-gray-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-400">Borradores</p>
          <p className="text-2xl font-semibold text-white">{estadisticas.borradores}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className="p-2 bg-blue-700 rounded-lg">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-400">Cotizados</p>
          <p className="text-2xl font-semibold text-white">{estadisticas.cotizados}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className="p-2 bg-yellow-900/50 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-400">Confirmados</p>
          <p className="text-2xl font-semibold text-white">{estadisticas.confirmados}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className="p-2 bg-green-900/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-400">Completados</p>
          <p className="text-2xl font-semibold text-white">{estadisticas.completados}</p>
        </div>
      </div>
    </div>
  </div>
);

// Badge de estado
const EstadoBadge: React.FC<{ estado: EstadoOrden }> = ({ estado }) => {
  const labels: Record<EstadoOrden, string> = {
    'borrador': 'Borrador',
    'cotizado': 'Cotizado',
    'confirmado': 'Confirmado',
    'completado': 'Completado'
  };

  const colors: Record<EstadoOrden, string> = {
    'borrador': 'bg-gray-700 text-gray-300 border border-gray-600',
    'cotizado': 'bg-blue-900/50 text-blue-300 border border-blue-700',
    'confirmado': 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    'completado': 'bg-green-900/50 text-green-300 border border-green-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[estado]}`}>
      {labels[estado]}
    </span>
  );
};

const OrdenesCompraList: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Estados para filtros y paginación
  const [search, setSearch] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState<EstadoOrden | ''>('');
  const [proveedorFilter, setProveedorFilter] = React.useState<number | ''>('');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  // Consultas
  const { data: ordenes = [], isLoading, error } = useQuery({
    queryKey: ['ordenes-compra', { estado: estadoFilter || undefined }],
    queryFn: () => ordenesCompraApi.getAll({ 
      estado: estadoFilter || undefined,
      skip: (page - 1) * itemsPerPage,
      limit: itemsPerPage 
    }),
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['ordenes-compra-estadisticas'],
    queryFn: ordenesCompraApi.getEstadisticas,
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresApi.getAll,
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: ordenesCompraApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra-estadisticas'] });
    },
  });

  // Filtrado local de órdenes
  const filteredOrdenes = React.useMemo(() => {
    return ordenes.filter((orden) => {
      const matchesSearch = !search || 
        orden.numero_requisicion?.toLowerCase().includes(search.toLowerCase()) ||
        orden.proveedor?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        orden.legajo?.toLowerCase().includes(search.toLowerCase());
      
      const matchesProveedor = !proveedorFilter || orden.proveedor_id === proveedorFilter;
      
      return matchesSearch && matchesProveedor;
    });
  }, [ordenes, search, proveedorFilter]);

  // Paginación
  const totalItems = filteredOrdenes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentOrdenes = filteredOrdenes.slice(startIndex, endIndex);

  const hasActiveFilters = search !== '' || estadoFilter !== '' || proveedorFilter !== '';

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setProveedorFilter('');
    setPage(1);
  };

  const handleDelete = (id: number, numeroCompra: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la orden ${numeroCompra || `#${id}`}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span>Cargando órdenes de compra...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Error al cargar las órdenes de compra</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Órdenes de Compra</h1>
          <p className="mt-2 text-sm text-gray-400">
            Gestiona los pedidos de repuestos y su seguimiento
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/ordenes-compra/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && <EstadisticasCard estadisticas={estadisticas} />}

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por número de compra, proveedor o legajo..."
              value={search}
              onChange={setSearch}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:items-end">
            <FilterSelect
              label="Estado"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoOrden | '')}
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'borrador', label: 'Borrador' },
                { value: 'pendiente_llegada', label: 'Pendiente de llegada' },
                { value: 'completada', label: 'Completada' },
              ]}
            />
            
            <FilterSelect
              label="Proveedor"
              value={proveedorFilter === '' ? '' : proveedorFilter.toString()}
              onChange={(e) => setProveedorFilter(e.target.value === '' ? '' : Number(e.target.value))}
              options={[
                { value: '', label: 'Todos los proveedores' },
                ...proveedores.map(proveedor => ({
                  value: proveedor.id.toString(),
                  label: proveedor.nombre
                }))
              ]}
            />

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Legajo</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrdenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-400">No se encontraron órdenes de compra</p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="mt-2">
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentOrdenes.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">
                    {orden.numero_requisicion || `#${orden.id}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">{orden.proveedor?.nombre || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={orden.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">{orden.items?.length || 0} items</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-300">{orden.legajo || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(orden.fecha_creacion).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link to={`/ordenes-compra/${orden.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {(orden.estado === 'borrador' || orden.estado === 'cotizado') && (
                        <>
                          <Link to={`/ordenes-compra/${orden.id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(orden.id, orden.numero_requisicion || '')}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {orden.estado === 'pendiente_llegada' && (
                        <Link to={`/ordenes-compra/${orden.id}/confirmar-llegada`}>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenesCompraList;
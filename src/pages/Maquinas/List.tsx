import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Pagination } from '../../components/ui/Pagination';
import { maquinasApi, modelosMaquinasApi } from '../../api';
import { Plus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';
import type { Maquina, ModeloMaquina } from '../../types';

const MaquinasList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [modeloFilter, setModeloFilter] = React.useState('all');
  const [ubicacionFilter, setUbicacionFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: maquinas = [], isLoading, error } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.getAll,
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ['modelos-maquinas'],
    queryFn: modelosMaquinasApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: maquinasApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maquinas'] });
    },
  });

  const filteredMaquinas = React.useMemo(() => {
    return maquinas.filter((maquina) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        maquina.numero_serie.toLowerCase().includes(searchLower) ||
        (maquina.alias?.toLowerCase().includes(searchLower)) ||
        (maquina.ubicacion?.toLowerCase().includes(searchLower)) ||
        (maquina.modelo?.modelo.toLowerCase().includes(searchLower)) ||
        (maquina.modelo?.fabricante?.toLowerCase().includes(searchLower));

      const matchesModelo = modeloFilter === 'all' || 
        (modeloFilter === 'none' ? !maquina.modelo_id : maquina.modelo_id.toString() === modeloFilter);

      const matchesUbicacion = ubicacionFilter === 'all' ||
        (ubicacionFilter === 'none' ? !maquina.ubicacion : maquina.ubicacion === ubicacionFilter);

      return matchesSearch && matchesModelo && matchesUbicacion;
    });
  }, [maquinas, search, modeloFilter, ubicacionFilter]);

  const uniqueUbicaciones = React.useMemo(() => {
    const ubicaciones = maquinas
      .map(m => m.ubicacion)
      .filter((ubicacion): ubicacion is string => Boolean(ubicacion));
    return [...new Set(ubicaciones)];
  }, [maquinas]);

  const totalItems = filteredMaquinas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentMaquinas = filteredMaquinas.slice(startIndex, endIndex);

  const hasActiveFilters = search !== '' || modeloFilter !== 'all' || ubicacionFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setModeloFilter('all');
    setUbicacionFilter('all');
    setPage(1);
  };

  const handleDelete = (id: number, numeroSerie: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la máquina "${numeroSerie}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [search, modeloFilter, ubicacionFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando máquinas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar las máquinas</div>
      </div>
    );
  }

  const modeloOptions = [
    { value: 'all', label: 'Todos los modelos' },
    { value: 'none', label: 'Sin modelo' },
    ...modelos.map(m => ({ 
      value: m.id.toString(), 
      label: `${m.fabricante ? m.fabricante + ' - ' : ''}${m.modelo}` 
    }))
  ];

  const ubicacionOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'none', label: 'Sin ubicación' },
    ...uniqueUbicaciones.map(u => ({ value: u, label: u }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Máquinas</h1>
        <Link to="/maquinas/nuevo">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Máquina
          </Button>
        </Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por número de serie, alias, ubicación, modelo o fabricante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                showClearButton={search.length > 0}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <FilterSelect
                label="Modelo"
                value={modeloFilter}
                onChange={(e) => setModeloFilter(e.target.value)}
                options={modeloOptions}
              />
              
              <FilterSelect
                label="Ubicación"
                value={ubicacionFilter}
                onChange={(e) => setUbicacionFilter(e.target.value)}
                options={ubicacionOptions}
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

          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>
                {totalItems} máquina{totalItems !== 1 ? 's' : ''} encontrada{totalItems !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtrado)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de máquinas */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Serie</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMaquinas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron máquinas con los filtros aplicados'
                      : 'No hay máquinas registradas'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                currentMaquinas.map((maquina) => (
                  <TableRow key={maquina.id}>
                    <TableCell className="font-mono">{maquina.numero_serie}</TableCell>
                    <TableCell className="font-medium">{maquina.alias || '-'}</TableCell>
                    <TableCell>{maquina.modelo?.modelo || '-'}</TableCell>
                    <TableCell>{maquina.modelo?.fabricante || '-'}</TableCell>
                    <TableCell>{maquina.ubicacion || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/maquinas/${maquina.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/maquinas/${maquina.id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(maquina.id, maquina.numero_serie)}
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

        {/* Paginación */}
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

export default MaquinasList;
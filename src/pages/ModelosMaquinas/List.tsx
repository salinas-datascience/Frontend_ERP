import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { modelosMaquinasApi } from '../../api';
import { Plus, Edit, Trash2, Eye, Filter, X } from 'lucide-react';

const ModelosMaquinasList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: modelos = [], isLoading, error } = useQuery({
    queryKey: ['modelos-maquinas'],
    queryFn: modelosMaquinasApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: modelosMaquinasApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-maquinas'] });
    },
  });

  const filteredModelos = React.useMemo(() => {
    return modelos.filter((modelo) => {
      const searchLower = search.toLowerCase();
      return (
        modelo.modelo.toLowerCase().includes(searchLower) ||
        (modelo.fabricante?.toLowerCase().includes(searchLower)) ||
        (modelo.detalle?.toLowerCase().includes(searchLower))
      );
    });
  }, [modelos, search]);

  const totalItems = filteredModelos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentModelos = filteredModelos.slice(startIndex, endIndex);

  const hasActiveFilters = search !== '';

  const clearFilters = () => {
    setSearch('');
    setPage(1);
  };

  const handleDelete = (id: number, modelo: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el modelo "${modelo}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando modelos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar los modelos</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Modelos de Máquinas</h1>
        <Link to="/modelos-maquinas/nuevo">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Modelo
          </Button>
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por modelo, fabricante o detalle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                showClearButton={search.length > 0}
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
                {totalItems} modelo{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtrado)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de modelos */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentModelos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    {hasActiveFilters 
                      ? 'No se encontraron modelos con los filtros aplicados'
                      : 'No hay modelos registrados'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                currentModelos.map((modelo) => (
                  <TableRow key={modelo.id}>
                    <TableCell className="font-medium">{modelo.modelo}</TableCell>
                    <TableCell>{modelo.fabricante || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{modelo.detalle || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/modelos-maquinas/${modelo.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/modelos-maquinas/${modelo.id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(modelo.id, modelo.modelo)}
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

export default ModelosMaquinasList;
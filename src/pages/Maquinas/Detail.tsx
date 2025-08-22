import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { maquinasApi } from '../../api';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

const MaquinasDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: maquina, isLoading, error } = useQuery({
    queryKey: ['maquina', id],
    queryFn: () => maquinasApi.getById(Number(id)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando máquina...</div>
      </div>
    );
  }

  if (error || !maquina) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar la máquina</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/maquinas')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Detalles de la Máquina
          </h1>
        </div>
        <Link to={`/maquinas/${maquina.id}/editar`}>
          <Button variant="primary">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Número de Serie
            </label>
            <p className="text-white font-mono text-lg">{maquina.numero_serie}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Alias
            </label>
            <p className="text-white text-lg">{maquina.alias || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Modelo
            </label>
            <p className="text-white text-lg">{maquina.modelo?.modelo || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Fabricante
            </label>
            <p className="text-white text-lg">{maquina.modelo?.fabricante || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ubicación
            </label>
            <p className="text-white text-lg">{maquina.ubicacion || '-'}</p>
          </div>

          {maquina.modelo?.detalle && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Detalle del Modelo
              </label>
              <p className="text-white text-lg">{maquina.modelo.detalle}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Información Adicional
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              ID de la Máquina
            </label>
            <p className="text-white font-mono">{maquina.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              ID del Modelo
            </label>
            <p className="text-white font-mono">{maquina.modelo_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaquinasDetail;
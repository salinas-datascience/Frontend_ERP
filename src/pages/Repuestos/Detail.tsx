import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { repuestosApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Edit, Package, MapPin, User, Hash, FileText } from 'lucide-react';

const RepuestosDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: repuesto, isLoading, error } = useQuery({
    queryKey: ['repuesto', id],
    queryFn: () => repuestosApi.getById(Number(id)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando repuesto...</div>
      </div>
    );
  }

  if (error || !repuesto) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar el repuesto</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/repuestos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">Detalle del Repuesto</h1>
        </div>
        <Link to={`/repuestos/${id}/editar`}>
          <Button variant="primary">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-blue-400" />
              <div>
                <label className="text-sm font-medium text-gray-400">Código</label>
                <p className="text-lg font-mono text-white">{repuesto.codigo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-blue-400" />
              <div>
                <label className="text-sm font-medium text-gray-400">Nombre</label>
                <p className="text-lg text-white">{repuesto.nombre}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className={`w-3 h-3 rounded-full ${
                  repuesto.cantidad_minima 
                    ? repuesto.cantidad > repuesto.cantidad_minima
                      ? 'bg-green-400' 
                      : repuesto.cantidad > 0 
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    : repuesto.cantidad > 10 
                      ? 'bg-green-400' 
                      : repuesto.cantidad > 0 
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                }`} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Cantidad</label>
                <p className="text-lg text-white">{repuesto.cantidad} unidades</p>
                {repuesto.cantidad_minima && (
                  <p className="text-xs text-gray-400">Mínimo: {repuesto.cantidad_minima}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <label className="text-sm font-medium text-gray-400">Ubicación</label>
                {repuesto.almacenamiento ? (
                  <div className="space-y-1">
                    <p className="text-lg text-white">{repuesto.almacenamiento.nombre}</p>
                    {repuesto.almacenamiento.ubicacion_fisica && (
                      <p className="text-sm text-gray-300">{repuesto.almacenamiento.ubicacion_fisica}</p>
                    )}
                    <p className="text-xs text-gray-400">Código: {repuesto.almacenamiento.codigo}</p>
                  </div>
                ) : repuesto.ubicacion ? (
                  <p className="text-lg text-white">{repuesto.ubicacion}</p>
                ) : (
                  <p className="text-lg text-gray-400">No especificada</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-400" />
              <div>
                <label className="text-sm font-medium text-gray-400">Proveedor</label>
                <p className="text-lg text-white">{repuesto.proveedor?.nombre || 'No asignado'}</p>
              </div>
            </div>
          </div>
        </div>

        {repuesto.detalle && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-400">Detalle</label>
                <p className="text-gray-100 mt-1 leading-relaxed">{repuesto.detalle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {repuesto.proveedor && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Información del Proveedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Nombre</label>
              <p className="text-white">{repuesto.proveedor.nombre}</p>
            </div>
            {repuesto.proveedor.contacto && (
              <div>
                <label className="text-sm font-medium text-gray-400">Contacto</label>
                <p className="text-white">{repuesto.proveedor.contacto}</p>
              </div>
            )}
            {repuesto.proveedor.telefono && (
              <div>
                <label className="text-sm font-medium text-gray-400">Teléfono</label>
                <p className="text-white">{repuesto.proveedor.telefono}</p>
              </div>
            )}
            {repuesto.proveedor.email && (
              <div>
                <label className="text-sm font-medium text-gray-400">Email</label>
                <p className="text-white">{repuesto.proveedor.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepuestosDetail;
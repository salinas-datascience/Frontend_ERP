import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { proveedoresApi } from '../../api';
import { ArrowLeft, Edit, Settings, Mail, Phone, User } from 'lucide-react';

const ProveedoresDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: proveedor, isLoading, error } = useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => proveedoresApi.getById(Number(id)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando proveedor...</div>
      </div>
    );
  }

  if (error || !proveedor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error al cargar el proveedor</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/proveedores')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Detalles del Proveedor
          </h1>
        </div>
        <Link to={`/proveedores/${proveedor.id}/editar`}>
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
              Nombre
            </label>
            <p className="text-white text-lg font-medium">{proveedor.nombre}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Contacto
            </label>
            {proveedor.contacto ? (
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <p className="text-white text-lg">{proveedor.contacto}</p>
              </div>
            ) : (
              <p className="text-white text-lg">-</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Teléfono
            </label>
            {proveedor.telefono ? (
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <a 
                  href={`tel:${proveedor.telefono}`}
                  className="text-blue-400 hover:underline text-lg"
                >
                  {proveedor.telefono}
                </a>
              </div>
            ) : (
              <p className="text-white text-lg">-</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            {proveedor.email ? (
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-400" />
                <a 
                  href={`mailto:${proveedor.email}`}
                  className="text-blue-400 hover:underline text-lg"
                >
                  {proveedor.email}
                </a>
              </div>
            ) : (
              <p className="text-white text-lg">-</p>
            )}
          </div>
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
              ID del Proveedor
            </label>
            <p className="text-white font-mono">{proveedor.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedoresDetail;
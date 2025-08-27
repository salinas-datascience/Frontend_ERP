import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { TIPOS_MANTENIMIENTO, ESTADOS_ORDEN_TRABAJO, NIVELES_CRITICIDAD } from '../../../types/orden-trabajo';
import type { OrdenTrabajo } from '../../../types';

interface DetalleOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden?: OrdenTrabajo;
  usuario?: { id: number; username: string; nombre_completo?: string };
  onEdit?: (orden: OrdenTrabajo) => void;
  onDelete?: (orden: OrdenTrabajo) => void;
}

const DetalleOTModal: React.FC<DetalleOTModalProps> = ({
  isOpen,
  onClose,
  orden,
  usuario,
  onEdit,
  onDelete
}) => {
  if (!orden) return null;

  const tipoData = TIPOS_MANTENIMIENTO.find(t => t.value === orden.tipo_mantenimiento);
  const estadoData = ESTADOS_ORDEN_TRABAJO.find(e => e.value === orden.estado);
  const criticidadData = NIVELES_CRITICIDAD.find(c => c.value === orden.nivel_criticidad);

  const fechaCreacion = new Date(orden.fecha_creacion);
  const fechaProgramada = new Date(orden.fecha_programada);
  const fechaInicio = orden.fecha_inicio ? new Date(orden.fecha_inicio) : null;
  const fechaFinalizacion = orden.fecha_finalizacion ? new Date(orden.fecha_finalizacion) : null;

  const isVencida = fechaProgramada < new Date() && orden.estado !== 'completada';
  const isEnProceso = orden.estado === 'en_proceso';
  const isCompletada = orden.estado === 'completada';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calcularDuracion = () => {
    if (!fechaInicio) return null;
    const fin = fechaFinalizacion || new Date();
    const duracion = Math.round((fin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60));
    return duracion;
  };

  const duracionReal = calcularDuracion();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-white">
                {orden.titulo}
              </h2>
              {tipoData && (
                <Badge className={`${tipoData.color} text-white`}>
                  <span className="mr-1">{tipoData.icon}</span>
                  {tipoData.label}
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              OT #{orden.id} • Creada el {formatDateOnly(fechaCreacion)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(orden)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && orden.estado === 'pendiente' && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 hover:text-red-300 border-red-600 hover:border-red-500"
                onClick={() => onDelete(orden)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Estado y Criticidad */}
        <div className="flex items-center gap-3 mb-6">
          {estadoData && (
            <Badge className={`${estadoData.color} text-white`}>
              {isCompletada && <CheckCircle className="w-3 h-3 mr-1" />}
              {isEnProceso && <Clock className="w-3 h-3 mr-1" />}
              {isVencida && <AlertTriangle className="w-3 h-3 mr-1" />}
              {estadoData.label}
            </Badge>
          )}
          
          {criticidadData && (
            <Badge className={`${criticidadData.color} text-white`}>
              {criticidadData.label}
            </Badge>
          )}
          
          {isVencida && (
            <Badge className="bg-red-600 text-white animate-pulse">
              VENCIDA
            </Badge>
          )}
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Máquina */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Máquina
            </h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="font-mono text-white font-medium">
                {orden.maquina.numero_serie}
              </div>
              {orden.maquina.alias && (
                <div className="text-gray-400 text-sm">({orden.maquina.alias})</div>
              )}
              {orden.maquina.modelo && (
                <div className="text-gray-400 text-sm mt-1">
                  {orden.maquina.modelo.fabricante} {orden.maquina.modelo.modelo}
                </div>
              )}
              {orden.maquina.ubicacion && (
                <div className="text-gray-500 text-xs mt-1">
                  📍 {orden.maquina.ubicacion}
                </div>
              )}
            </div>
          </div>

          {/* Técnico asignado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center">
              <User className="w-4 h-4 mr-2" />
              Técnico Asignado
            </h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-white font-medium">
                {orden.usuario_asignado.nombre_completo || orden.usuario_asignado.username}
              </div>
              {orden.usuario_asignado.nombre_completo && (
                <div className="text-gray-400 text-sm">
                  @{orden.usuario_asignado.username}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {orden.descripcion && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Descripción</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">{orden.descripcion}</p>
            </div>
          </div>
        )}

        {/* Fechas y tiempos */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Cronología
          </h3>
          
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fecha programada:</span>
              <span className={`font-medium ${isVencida ? 'text-red-400' : 'text-white'}`}>
                {formatDateOnly(fechaProgramada)}
                {isVencida && ' (Vencida)'}
              </span>
            </div>
            
            {fechaInicio && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Iniciada:</span>
                <span className="text-white">{formatDate(fechaInicio)}</span>
              </div>
            )}
            
            {fechaFinalizacion && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Finalizada:</span>
                <span className="text-green-400">{formatDate(fechaFinalizacion)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tiempo estimado:</span>
                <span className="text-white">
                  {orden.tiempo_estimado_horas ? `${orden.tiempo_estimado_horas}h` : 'No especificado'}
                </span>
              </div>
              
              {duracionReal !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tiempo real:</span>
                  <span className={`font-medium ${
                    orden.tiempo_estimado_horas && duracionReal > orden.tiempo_estimado_horas 
                      ? 'text-orange-400' 
                      : 'text-green-400'
                  }`}>
                    {duracionReal}h
                  </span>
                </div>
              )}
              
              {orden.tiempo_estimado_horas && duracionReal !== null && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Diferencia:</span>
                  <span className={`${
                    duracionReal > orden.tiempo_estimado_horas ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {duracionReal > orden.tiempo_estimado_horas ? '+' : ''}{duracionReal - orden.tiempo_estimado_horas}h
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comentarios */}
        {orden.comentarios && orden.comentarios.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-white mb-3">
              Comentarios ({orden.comentarios.length})
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto space-y-3">
              {orden.comentarios.map((comentario) => (
                <div key={comentario.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 font-medium">
                      {comentario.usuario.nombre_completo || comentario.usuario.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comentario.fecha_creacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-300">{comentario.comentario}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export { DetalleOTModal };
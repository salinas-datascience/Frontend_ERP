import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit2, 
  Package, 
  Calendar,
  User,
  Building,
  FileText,
  Download,
  Upload,
  Check,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ordenesCompraApi } from '../../api/ordenes-compra';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate } from '../../lib/utils';
// Tipos definidos localmente para evitar problemas de importación
interface OrdenCompraResponse {
  id: number;
  numero_requisicion?: string;
  proveedor_id: number;
  legajo?: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones?: string;
  usuario_creador_id: number;
  proveedor?: {
    id: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
  };
  items: Array<{
    id: number;
    orden_id: number;
    repuesto_id?: number;
    cantidad_pedida: number;
    cantidad_recibida: number;
    descripcion_aduana?: string;
    precio_unitario?: string;
    fecha_creacion: string;
    repuesto?: {
      id: number;
      codigo: string;
      nombre: string;
      detalle?: string;
    };
    es_item_manual?: boolean;
    nombre_manual?: string;
    codigo_manual?: string;
    detalle_manual?: string;
    cantidad_minima_manual?: number;
  }>;
  documentos: Array<{
    id: number;
    orden_id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
    tamaño_archivo: number;
    fecha_subida: string;
    usuario_subida_id: number;
  }>;
}

const EstadosOrden = {
  BORRADOR: 'borrador' as const,
  COTIZADO: 'cotizado' as const,
  CONFIRMADO: 'confirmado' as const,
  COMPLETADO: 'completado' as const,
};

const OrdenCompraDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [numeroRequisicion, setNumeroRequisicion] = React.useState('');
  const [legajo, setLegajo] = React.useState('');
  const [showRequisicionModal, setShowRequisicionModal] = React.useState(false);
  const [showLegajoModal, setShowLegajoModal] = React.useState(false);

  const { data: orden, isLoading, error } = useQuery({
    queryKey: ['orden-compra', id],
    queryFn: () => ordenesCompraApi.getById(Number(id!)),
    enabled: !!id,
  });

  const updateStateMutation = useMutation({
    mutationFn: ({ estado, numero_requisicion, legajo }: { estado?: string, numero_requisicion?: string, legajo?: string }) => 
      ordenesCompraApi.update(Number(id!), { estado, numero_requisicion, legajo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      setShowRequisicionModal(false);
      setShowLegajoModal(false);
      setNumeroRequisicion('');
      setLegajo('');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !orden) {
    return (
      <div className="p-6">
        <div className="text-red-600 dark:text-red-400">
          Error al cargar la orden de compra
        </div>
      </div>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case EstadosOrden.BORRADOR:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case EstadosOrden.COTIZADO:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case EstadosOrden.CONFIRMADO:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case EstadosOrden.COMPLETADO:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const canEdit = orden.estado === EstadosOrden.BORRADOR || orden.estado === EstadosOrden.COTIZADO;
  const canQuote = orden.estado === EstadosOrden.BORRADOR;
  const canConfirm = orden.estado === EstadosOrden.COTIZADO;
  const canConfirmArrival = orden.estado === EstadosOrden.CONFIRMADO;

  const handleExportToExcel = () => {
    // Preparar los datos para exportar
    const exportData = orden.items.map((item, index) => {
      const isManual = item.es_item_manual;
      const precio = parseFloat(item.precio_unitario || '0');
      const total = precio * item.cantidad_pedida;
      
      return {
        'N°': index + 1,
        'ID': item.id,
        'Orden ID': item.orden_id,
        'Repuesto ID': item.repuesto_id || '',
        'Nombre': isManual ? item.nombre_manual : item.repuesto?.nombre || '',
        'Código': isManual ? item.codigo_manual : item.repuesto?.codigo || '',
        'Detalle': isManual ? item.detalle_manual : item.repuesto?.detalle || '',
        'Cantidad Pedida': item.cantidad_pedida,
        'Cantidad Recibida': item.cantidad_recibida,
        'Descripción Aduana': item.descripcion_aduana || '',
        'Precio Unitario': item.precio_unitario || '',
        'Total': precio > 0 ? total.toFixed(2) : '',
        'Es Item Manual': isManual ? 'Sí' : 'No',
        'Cantidad Mínima Manual': item.cantidad_minima_manual || '',
        'Fecha Creación': new Date(item.fecha_creacion).toLocaleDateString('es-ES')
      };
    });

    // Crear el libro de trabajo
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');

    // Configurar el ancho de las columnas
    const colWidths = [
      { wch: 5 },   // N°
      { wch: 8 },   // ID
      { wch: 10 },  // Orden ID
      { wch: 12 },  // Repuesto ID
      { wch: 30 },  // Nombre
      { wch: 15 },  // Código
      { wch: 40 },  // Detalle
      { wch: 12 },  // Cantidad Pedida
      { wch: 12 },  // Cantidad Recibida
      { wch: 25 },  // Descripción Aduana
      { wch: 15 },  // Precio Unitario
      { wch: 15 },  // Total
      { wch: 15 },  // Es Item Manual
      { wch: 18 },  // Cantidad Mínima Manual
      { wch: 15 }   // Fecha Creación
    ];
    ws['!cols'] = colWidths;

    // Generar y descargar el archivo
    const fileName = `Orden_Compra_${orden.id}_Items_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleQuote = () => {
    setShowRequisicionModal(true);
  };

  const handleConfirm = () => {
    setShowLegajoModal(true);
  };

  const handleSubmitRequisicion = () => {
    if (!numeroRequisicion.trim()) {
      alert('Debe ingresar el número de requisición');
      return;
    }
    updateStateMutation.mutate({ 
      estado: EstadosOrden.COTIZADO, 
      numero_requisicion: numeroRequisicion 
    });
  };

  const handleSubmitLegajo = () => {
    if (!legajo.trim()) {
      alert('Debe ingresar el legajo');
      return;
    }
    updateStateMutation.mutate({ 
      estado: EstadosOrden.CONFIRMADO, 
      legajo: legajo 
    });
  };

  const totalItems = orden.items.length;
  const totalPedido = orden.items.reduce((sum, item) => {
    const precio = parseFloat(item.precio_unitario || '0');
    return sum + (precio * item.cantidad_pedida);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ordenes-compra')}
            className="text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Orden de Compra
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getEstadoBadgeColor(orden.estado)}>
                {orden.estado}
              </Badge>
              {orden.numero_requisicion && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  N° {orden.numero_requisicion}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/ordenes-compra/${id}/editar`)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          
          {canQuote && (
            <Button
              onClick={handleQuote}
              disabled={updateStateMutation.isPending}
            >
              <FileText className="w-4 h-4 mr-2" />
              Cotizar
            </Button>
          )}
          
          {canConfirm && (
            <Button
              onClick={handleConfirm}
              disabled={updateStateMutation.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          )}
          
          {canConfirmArrival && (
            <Button
              onClick={() => navigate(`/ordenes-compra/${id}/confirmar-llegada`)}
              variant="default"
            >
              <Package className="w-4 h-4 mr-2" />
              Confirmar Llegada
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Proveedor
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {orden.proveedor?.nombre}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Creación
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(orden.fecha_creacion)}
                    </span>
                  </div>
                </div>

                {orden.numero_requisicion && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número de Requisición
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {orden.numero_requisicion}
                      </span>
                    </div>
                  </div>
                )}

                {orden.legajo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Legajo
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {orden.legajo}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {orden.observaciones && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Observaciones
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-900 dark:text-white text-sm">
                      {orden.observaciones}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items de la Orden */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">
                  Items ({totalItems})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 text-gray-700 dark:text-gray-300 font-medium">
                        Item
                      </th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">
                        Cantidad
                      </th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">
                        Precio Unit.
                      </th>
                      <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">
                        Total
                      </th>
                      {orden.estado !== EstadosOrden.BORRADOR && (
                        <th className="text-right py-3 text-gray-700 dark:text-gray-300 font-medium">
                          Recibido
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {orden.items.map((item, index) => {
                      const precio = parseFloat(item.precio_unitario || '0');
                      const total = precio * item.cantidad_pedida;
                      const isManual = item.es_item_manual;

                      return (
                        <tr 
                          key={index} 
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="py-3">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {isManual ? item.nombre_manual : item.repuesto?.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {isManual ? `Código: ${item.codigo_manual}` : `Código: ${item.repuesto?.codigo}`}
                                {isManual && (
                                  <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    Manual
                                  </Badge>
                                )}
                              </div>
                              {item.descripcion_aduana && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Aduana: {item.descripcion_aduana}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right text-gray-900 dark:text-white">
                            {item.cantidad_pedida}
                          </td>
                          <td className="py-3 text-right text-gray-900 dark:text-white">
                            {precio > 0 ? formatCurrency(precio) : '-'}
                          </td>
                          <td className="py-3 text-right text-gray-900 dark:text-white">
                            {precio > 0 ? formatCurrency(total) : '-'}
                          </td>
                          {orden.estado !== EstadosOrden.BORRADOR && (
                            <td className="py-3 text-right">
                              <span className={`${item.cantidad_recibida > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                {item.cantidad_recibida}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalPedido > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Estimado
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalPedido)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          {orden.documentos && orden.documentos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Documentos ({orden.documentos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orden.documentos.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.nombre_archivo}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(doc.fecha_subida)} • {(doc.tamaño_archivo / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalItems}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                <Badge className={`text-xs ${getEstadoBadgeColor(orden.estado)}`}>
                  {orden.estado}
                </Badge>
              </div>
              {totalPedido > 0 && (
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Estimado:
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalPedido)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canEdit && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/ordenes-compra/${id}/editar`)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Orden
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/ordenes-compra/${id}/documents`)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Documentos
              </Button>

              {orden.estado === EstadosOrden.BORRADOR && (
                <div className="pt-2">
                  <div className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Orden en borrador. Complete los datos necesarios y envíe a llegada.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para número de requisición */}
      <Modal 
        isOpen={showRequisicionModal} 
        onClose={() => setShowRequisicionModal(false)}
        title="Cotizar Orden"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingrese el número de requisición para proceder con la cotización:
          </p>
          <Input
            type="text"
            value={numeroRequisicion}
            onChange={(e) => setNumeroRequisicion(e.target.value)}
            placeholder="Ej: REQ-2024-001"
            className="w-full"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowRequisicionModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitRequisicion}
              disabled={updateStateMutation.isPending || !numeroRequisicion.trim()}
            >
              {updateStateMutation.isPending ? 'Guardando...' : 'Cotizar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para legajo */}
      <Modal 
        isOpen={showLegajoModal} 
        onClose={() => setShowLegajoModal(false)}
        title="Confirmar Orden"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingrese el número de legajo para confirmar la orden:
          </p>
          <Input
            type="text"
            value={legajo}
            onChange={(e) => setLegajo(e.target.value)}
            placeholder="Ej: LEG-2024-001"
            className="w-full"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLegajoModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitLegajo}
              disabled={updateStateMutation.isPending || !legajo.trim()}
            >
              {updateStateMutation.isPending ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdenCompraDetail;
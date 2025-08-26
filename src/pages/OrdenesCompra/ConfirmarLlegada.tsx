import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Package, 
  Check,
  AlertCircle,
  Calculator,
  Truck,
  ClipboardCheck
} from 'lucide-react';
import { ordenesCompraApi } from '../../api/ordenes-compra';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
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
    nombre: string;
  };
  items: Array<{
    id: number;
    cantidad_pedida: number;
    cantidad_recibida: number;
    descripcion_aduana?: string;
    repuesto?: {
      nombre: string;
      codigo: string;
    };
    es_item_manual?: boolean;
    nombre_manual?: string;
    codigo_manual?: string;
    detalle_manual?: string;
  }>;
}

const EstadosOrden = {
  BORRADOR: 'borrador' as const,
  COTIZADO: 'cotizado' as const,
  CONFIRMADO: 'confirmado' as const,
  COMPLETADO: 'completado' as const,
};

interface ConfirmarLlegadaRequest {
  items_recibidos: Array<{
    item_id: number;
    cantidad_recibida: number;
  }>;
}

const ConfirmarLlegada: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cantidadesRecibidas, setCantidadesRecibidas] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: orden, isLoading, error } = useQuery({
    queryKey: ['orden-compra', id],
    queryFn: () => ordenesCompraApi.getById(Number(id!)),
    enabled: !!id,
  });

  const confirmarLlegadaMutation = useMutation({
    mutationFn: (llegada: ConfirmarLlegadaRequest) => 
      ordenesCompraApi.confirmarLlegada(Number(id!), llegada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      navigate(`/ordenes-compra/${id}`);
    },
    onError: (error: any) => {
      setErrors({
        general: error?.response?.data?.detail || 'Error al confirmar llegada'
      });
    }
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

  if (orden.estado !== EstadosOrden.CONFIRMADO) {
    return (
      <div className="p-6">
        <div className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Esta orden no está en estado "Confirmado"
        </div>
      </div>
    );
  }

  const handleCantidadChange = (itemId: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0;
    setCantidadesRecibidas(prev => ({
      ...prev,
      [itemId]: cantidadNum
    }));
    
    // Clear error if fixed
    if (errors[`item_${itemId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`item_${itemId}`];
        return newErrors;
      });
    }
  };

  const autocompletarTodo = () => {
    const nuevasCantidades: Record<number, number> = {};
    orden.items.forEach(item => {
      nuevasCantidades[item.id] = item.cantidad_pedida;
    });
    setCantidadesRecibidas(nuevasCantidades);
  };

  const limpiarTodo = () => {
    setCantidadesRecibidas({});
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasReceivedItems = false;

    orden.items.forEach(item => {
      const cantidadRecibida = cantidadesRecibidas[item.id] || 0;
      
      if (cantidadRecibida > 0) {
        hasReceivedItems = true;
      }
      
      if (cantidadRecibida > item.cantidad_pedida) {
        newErrors[`item_${item.id}`] = `No puede recibir más de ${item.cantidad_pedida} unidades`;
      }
    });

    if (!hasReceivedItems) {
      newErrors.general = 'Debe recibir al menos un item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validarFormulario()) return;

    const itemsRecibidos = orden.items
      .filter(item => (cantidadesRecibidas[item.id] || 0) > 0)
      .map(item => ({
        item_id: item.id,
        cantidad_recibida: cantidadesRecibidas[item.id] || 0
      }));

    confirmarLlegadaMutation.mutate({
      items_recibidos: itemsRecibidos
    });
  };

  const totalItems = orden.items.length;
  const itemsConCantidad = Object.values(cantidadesRecibidas).filter(c => c > 0).length;
  const totalRecibido = Object.values(cantidadesRecibidas).reduce((sum, cant) => sum + cant, 0);
  const totalPedido = orden.items.reduce((sum, item) => sum + item.cantidad_pedida, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ordenes-compra/${id}`)}
            className="text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirmar Llegada de Repuestos
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orden {orden.numero_requisicion || `#${orden.id}`} - {orden.proveedor?.nombre}
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {orden.estado}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={limpiarTodo}
            disabled={confirmarLlegadaMutation.isPending}
          >
            Limpiar Todo
          </Button>
          <Button
            variant="outline"
            onClick={autocompletarTodo}
            disabled={confirmarLlegadaMutation.isPending}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Completar Todo
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={confirmarLlegadaMutation.isPending || itemsConCantidad === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar Llegada
          </Button>
        </div>
      </div>

      {/* Error general */}
      {errors.general && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            {errors.general}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Items a Recibir */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">
                  Items de la Orden ({totalItems})
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Truck className="w-4 h-4" />
                  <span>Recibiendo: {itemsConCantidad}/{totalItems}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orden.items.map((item) => {
                  const cantidadRecibida = cantidadesRecibidas[item.id] || 0;
                  const isManual = item.es_item_manual;
                  const error = errors[`item_${item.id}`];

                  return (
                    <div 
                      key={item.id}
                      className={`p-4 border rounded-lg ${error ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                        {/* Item Info */}
                        <div className="lg:col-span-2">
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

                        {/* Cantidad Pedida */}
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Pedido</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.cantidad_pedida}
                          </div>
                        </div>

                        {/* Input Cantidad Recibida */}
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                            Cantidad Recibida
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={item.cantidad_pedida}
                            value={cantidadRecibida || ''}
                            onChange={(e) => handleCantidadChange(item.id, e.target.value)}
                            className={error ? 'border-red-300' : ''}
                            placeholder="0"
                          />
                          {error && (
                            <div className="text-xs text-red-500 mt-1">
                              {error}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {cantidadRecibida > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>{Math.round((cantidadRecibida / item.cantidad_pedida) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((cantidadRecibida / item.cantidad_pedida) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral - Resumen */}
        <div className="space-y-6">
          {/* Resumen de Llegada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Resumen de Llegada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Items Total:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalItems}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Items Recibidos:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {itemsConCantidad}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cantidad Pedida:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {totalPedido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cantidad Recibida:</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {totalRecibido}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Información de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Proveedor</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {orden.proveedor?.nombre}
                </div>
              </div>
              {orden.numero_requisicion && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">N° Requisición</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {orden.numero_requisicion}
                  </div>
                </div>
              )}
              {orden.legajo && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Legajo</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {orden.legajo}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fecha Creación</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(orden.fecha_creacion)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <div>• Ingrese las cantidades realmente recibidas</div>
                <div>• No puede exceder la cantidad pedida</div>
                <div>• Los items recibidos se agregarán automáticamente al inventario</div>
                <div>• Use "Completar Todo" si recibió todo lo pedido</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarLlegada;
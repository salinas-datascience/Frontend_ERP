import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para invalidar todas las queries relacionadas con repuestos
 * Útil después de operaciones que modifican el estado de los repuestos
 */
export const useInvalidateRepuestos = () => {
  const queryClient = useQueryClient();

  const invalidateRepuestos = () => {
    // Invalidar todas las queries de repuestos
    queryClient.invalidateQueries({ queryKey: ['repuestos'] });
    queryClient.invalidateQueries({ queryKey: ['repuestos-search'] });
  };

  const invalidateRepuesto = (id: string | number) => {
    // Invalidar query específica de un repuesto
    queryClient.invalidateQueries({ queryKey: ['repuesto', id] });
    // También invalidar las queries generales
    invalidateRepuestos();
  };

  return {
    invalidateRepuestos,
    invalidateRepuesto,
  };
};
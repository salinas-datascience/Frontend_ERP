import { useMemo } from 'react';
import type { Maquina } from '../../../types';
import type { GroupingType } from '../components/GroupingControls';

interface GroupedMachine {
  group: string;
  machines: Maquina[];
  count: number;
}

export const useGroupedMachines = (machines: Maquina[], groupBy: GroupingType) => {
  return useMemo(() => {
    if (groupBy === 'none') {
      return [{ group: 'Todas las máquinas', machines, count: machines.length }];
    }

    const groups: Record<string, Maquina[]> = {};

    machines.forEach(machine => {
      let groupKey: string;

      switch (groupBy) {
        case 'ubicacion':
          groupKey = machine.ubicacion || 'Sin ubicación';
          break;
        case 'modelo':
          groupKey = machine.modelo 
            ? `${machine.modelo.fabricante} ${machine.modelo.modelo}`
            : 'Sin modelo';
          break;
        case 'tipo':
          groupKey = machine.modelo?.fabricante || 'Sin fabricante';
          break;
        case 'estado':
          groupKey = machine.activa ? 'Activas' : 'Inactivas';
          break;
        default:
          groupKey = 'Otros';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(machine);
    });

    // Convertir a array y ordenar
    return Object.entries(groups)
      .map(([group, machines]) => ({
        group,
        machines: machines.sort((a, b) => a.numero_serie.localeCompare(b.numero_serie)),
        count: machines.length
      }))
      .sort((a, b) => {
        // Ordenar grupos por nombre, pero mantener "Sin..." al final
        if (a.group.startsWith('Sin') && !b.group.startsWith('Sin')) return 1;
        if (!a.group.startsWith('Sin') && b.group.startsWith('Sin')) return -1;
        return a.group.localeCompare(b.group);
      });
  }, [machines, groupBy]);
};
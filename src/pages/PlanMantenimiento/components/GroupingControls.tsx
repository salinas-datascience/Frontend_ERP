import React from 'react';
import { FilterSelect } from '../../../components/ui/FilterSelect';
import { Button } from '../../../components/ui/Button';
import { FolderOpen, Layers, Settings, MapPin } from 'lucide-react';

export type GroupingType = 'none' | 'ubicacion' | 'modelo' | 'tipo' | 'estado';

interface GroupingControlsProps {
  groupBy: GroupingType;
  onGroupByChange: (groupBy: GroupingType) => void;
  showCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const groupingOptions = [
  { value: 'none' as GroupingType, label: 'Sin agrupar', icon: Layers },
  { value: 'ubicacion' as GroupingType, label: 'Por ubicación', icon: MapPin },
  { value: 'modelo' as GroupingType, label: 'Por modelo', icon: Settings },
  { value: 'tipo' as GroupingType, label: 'Por tipo', icon: FolderOpen },
];

export const GroupingControls: React.FC<GroupingControlsProps> = ({
  groupBy,
  onGroupByChange,
  showCollapsed,
  onToggleCollapsed
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Agrupar:</span>
      </div>
      
      <FilterSelect
        value={groupBy}
        onChange={(e) => onGroupByChange(e.target.value as GroupingType)}
        options={groupingOptions.map(opt => ({ value: opt.value, label: opt.label }))}
      />

      {groupBy !== 'none' && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapsed}
          className="ml-2"
        >
          {showCollapsed ? 'Expandir grupos' : 'Colapsar grupos'}
        </Button>
      )}
    </div>
  );
};
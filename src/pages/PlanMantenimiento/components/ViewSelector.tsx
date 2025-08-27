import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Calendar, Grid, BarChart3, List } from 'lucide-react';

export type ViewType = 'timeline' | 'gantt' | 'calendar' | 'table';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewOptions = [
  { value: 'timeline' as ViewType, label: 'Timeline', icon: Calendar, description: 'Vista semanal actual' },
  { value: 'gantt' as ViewType, label: 'Gantt', icon: BarChart3, description: 'Diagrama de barras horizontales' },
  { value: 'calendar' as ViewType, label: 'Calendario', icon: Grid, description: 'Vista de calendario mensual' },
  { value: 'table' as ViewType, label: 'Tabla', icon: List, description: 'Vista tabular tipo Excel' }
];

export const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
      {viewOptions.map(({ value, label, icon: Icon, description }) => (
        <Button
          key={value}
          variant={currentView === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(value)}
          title={description}
          className={`relative ${
            currentView === value 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
};
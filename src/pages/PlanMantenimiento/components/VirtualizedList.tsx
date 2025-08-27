import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number; // Número de elementos extra a renderizar fuera de la vista
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular qué elementos están visibles
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length - 1, visibleEnd + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Elementos a renderizar
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange.start, visibleRange.end]);

  // Manejar scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Altura total del contenido
  const totalHeight = items.length * itemHeight;

  // Offset para posicionar correctamente los elementos visibles
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      {/* Elemento invisible para mantener la altura total */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container de elementos visibles */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
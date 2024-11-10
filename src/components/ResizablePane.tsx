import React, { useState, useCallback } from 'react';

interface ResizablePaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth: number;
}

function ResizablePane({ leftPane, rightPane, initialLeftWidth }: ResizablePaneProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const container = e.currentTarget as HTMLDivElement;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit the resizing range
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isDragging]
  );

  return (
    <div
      className="flex-1 flex relative w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="h-full overflow-auto"
        style={{ width: `${leftWidth}%`, minWidth: 0 }}
      >
        {leftPane}
      </div>

      <div
        className={`w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize relative z-10 flex-shrink-0 ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 -mx-1" />
      </div>

      <div
        className="h-full overflow-auto flex-1"
        style={{ width: `${100 - leftWidth}%`, minWidth: 0 }}
      >
        {rightPane}
      </div>
    </div>
  );
}

export default ResizablePane;
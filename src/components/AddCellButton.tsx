import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddCellButtonProps {
  index: number;
  onAdd: (type: 'code' | 'markdown', index: number) => void;
}

function AddCellButton({ index, onAdd }: AddCellButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-2 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 bg-gray-800 rounded-lg shadow-lg p-1">
          <button
            onClick={() => onAdd('code', index)}
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-gray-700 rounded"
          >
            <Plus className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => onAdd('markdown', index)}
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-gray-700 rounded"
          >
            <Plus className="w-3 h-3" />
            Markdown
          </button>
        </div>
      )}
    </div>
  );
}

export default AddCellButton;
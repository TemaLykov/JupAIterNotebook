import React, { useEffect, useState } from 'react';
import { Cell } from '../types';
import AddCellButton from './AddCellButton';
import NotebookCell from './NotebookCell';
import KernelStatus from './KernelStatus';
import { createKernelService } from '../services/KernelService';
import './NotebookEditor.css';

interface NotebookEditorProps {
  cells: Cell[];
  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  activeCell: string | null;
  setActiveCell: (id: string | null) => void;
  attachedCell: string | null;
  setAttachedCell: (id: string | null) => void;
  pythonEnv: string;
}

function NotebookEditor({
  cells,
  setCells,
  activeCell,
  setActiveCell,
  attachedCell,
  setAttachedCell,
  pythonEnv,
}: NotebookEditorProps) {
  const [kernelService, setKernelService] = useState<ReturnType<typeof createKernelService> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (pythonEnv) {
      const service = createKernelService(pythonEnv);
      setKernelService(service);

      service.connect()
        .then(() => setIsConnected(true))
        .catch(error => {
          console.error('Failed to connect to kernel:', error);
          setIsConnected(false);
        });

      return () => {
        service.disconnect();
      };
    }
  }, [pythonEnv]);

  const addCell = (type: 'code' | 'markdown', index: number) => {
    const newCell: Cell = {
      id: Date.now().toString(),
      type,
      content: '',
      outputs: [],
      status: 'idle'
    };
    setCells((prev) => [
      ...prev.slice(0, index),
      newCell,
      ...prev.slice(index)
    ]);
    setActiveCell(newCell.id);
  };

  const updateCell = (id: string, content: string) => {
    setCells((prev) =>
      prev.map((cell) => (cell.id === id ? { ...cell, content } : cell))
    );
  };

  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
    if (activeCell === id) {
      setActiveCell(null);
    }
    if (attachedCell === id) {
      setAttachedCell(null);
    }
  };

  const executeCell = async (cell: Cell) => {
    if (!kernelService) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cell.id
            ? {
                ...c,
                status: 'error',
                outputs: [{
                  output_type: 'error',
                  text: ['No kernel connection. Please configure Python environment in settings.'],
                }]
              }
            : c
        )
      );
      return;
    }

    setCells((prev) =>
      prev.map((c) =>
        c.id === cell.id
          ? { ...c, status: 'running', outputs: [] }
          : c
      )
    );

    try {
      await kernelService.executeCode(cell.content, (output) => {
        setCells((prev) =>
          prev.map((c) =>
            c.id === cell.id
              ? {
                  ...c,
                  outputs: [...c.outputs, output],
                }
              : c
          )
        );
      });

      setCells((prev) =>
        prev.map((c) =>
          c.id === cell.id
            ? { ...c, status: 'success' }
            : c
        )
      );
    } catch (error) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cell.id
            ? { ...c, status: 'error' }
            : c
        )
      );
    }
  };

  const handleRestartKernel = async () => {
    if (kernelService) {
      kernelService.disconnect();
      setIsConnected(false);
      
      try {
        await kernelService.connect();
        setIsConnected(true);
        
        // Clear all outputs and reset cell statuses
        setCells(prev => prev.map(cell => ({
          ...cell,
          outputs: [],
          status: 'idle'
        })));
      } catch (error) {
        console.error('Failed to restart kernel:', error);
      }
    }
  };

  const handleClearOutputs = () => {
    setCells(prev => prev.map(cell => ({
      ...cell,
      outputs: [],
      status: 'idle'
    })));
  };

  const moveToNextCell = (currentCellId: string) => {
    const currentIndex = cells.findIndex(cell => cell.id === currentCellId);
    if (currentIndex === -1) return;

    if (currentIndex < cells.length - 1) {
      // Move to next cell
      setActiveCell(cells[currentIndex + 1].id);
    } else {
      // Create new cell of the same type
      const currentCell = cells[currentIndex];
      addCell(currentCell.type, currentIndex + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      <KernelStatus
        isConnected={isConnected}
        onRestart={handleRestartKernel}
        onClearOutputs={handleClearOutputs}
        pythonEnv={pythonEnv}
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-[900px] mx-auto">
          <AddCellButton index={0} onAdd={addCell} />
          
          {cells.map((cell, index) => (
            <React.Fragment key={cell.id}>
              <NotebookCell
                cell={cell}
                index={index}
                isActive={cell.id === activeCell}
                onUpdate={(content) => updateCell(cell.id, content)}
                onDelete={() => deleteCell(cell.id)}
                onExecute={() => executeCell(cell)}
                onAttach={() => setAttachedCell(cell.id === attachedCell ? null : cell.id)}
                isAttached={cell.id === attachedCell}
                onMoveToNextCell={() => moveToNextCell(cell.id)}
              />
              <AddCellButton index={index + 1} onAdd={addCell} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotebookEditor;
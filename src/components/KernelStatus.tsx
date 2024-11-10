import React from 'react';
import { RefreshCw, Power, Trash2, AlertCircle } from 'lucide-react';

interface KernelStatusProps {
  isConnected: boolean;
  onRestart: () => void;
  onClearOutputs: () => void;
  pythonEnv: string;
}

function KernelStatus({ isConnected, onRestart, onClearOutputs, pythonEnv }: KernelStatusProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-300">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {pythonEnv && (
          <span className="text-sm text-gray-500">
            ({pythonEnv})
          </span>
        )}
      </div>
      
      <div className="flex-1" />
      
      {!isConnected && (
        <div className="flex items-center gap-2 text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          Check kernel settings
        </div>
      )}
      
      <button
        onClick={onRestart}
        className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
        title="Restart Kernel"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      
      <button
        onClick={onClearOutputs}
        className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
        title="Clear All Outputs"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default KernelStatus;
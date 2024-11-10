import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Settings } from '../types';
import KernelSetup from './KernelSetup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [showKernelSetup, setShowKernelSetup] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      openaiKey: formData.get('openaiKey') as string,
      model: formData.get('model') as 'gpt-4o' | 'gpt-4o-mini',
      pythonEnv: formData.get('pythonEnv') as string,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-gray-800 rounded-lg w-[500px] shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                name="openaiKey"
                defaultValue={settings.openaiKey}
                className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                GPT Model
              </label>
              <select
                name="model"
                defaultValue={settings.model}
                className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o-mini</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Python Environment URL
                </label>
                <button
                  type="button"
                  onClick={() => setShowKernelSetup(true)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  Setup Instructions
                </button>
              </div>
              <input
                type="text"
                name="pythonEnv"
                defaultValue={settings.pythonEnv}
                placeholder="http://localhost:8888"
                className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter the Jupyter kernel gateway URL
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <KernelSetup 
        isVisible={showKernelSetup} 
        onClose={() => setShowKernelSetup(false)} 
      />
    </>
  );
}

export default SettingsModal;
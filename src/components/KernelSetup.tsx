import React from 'react';
import { Terminal, ExternalLink } from 'lucide-react';

interface KernelSetupProps {
  isVisible: boolean;
  onClose: () => void;
}

function KernelSetup({ isVisible, onClose }: KernelSetupProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-[600px] shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Python Kernel Setup
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <p>To connect to a Python kernel, follow these steps:</p>
            
            <ol className="list-decimal list-inside space-y-3">
              <li>Install Jupyter if you haven't already:
                <pre className="mt-2 p-3 bg-gray-900 rounded-md font-mono text-sm">
                  pip install jupyter
                </pre>
              </li>
              
              <li>Start the Jupyter kernel gateway:
                <pre className="mt-2 p-3 bg-gray-900 rounded-md font-mono text-sm">
                  jupyter kernelgateway --KernelGatewayApp.allow_origin='*' --KernelGatewayApp.allow_credentials='*' --KernelGatewayApp.allow_headers='*' --KernelGatewayApp.allow_methods='*'
                </pre>
              </li>
              
              <li>Copy the kernel URL (usually <code>http://localhost:8888</code>)</li>
              
              <li>Paste the URL in the Settings → Python Environment field</li>
            </ol>

            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Important Notes
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Keep the terminal with the kernel gateway running</li>
                <li>Make sure no other Jupyter instances are using port 8888</li>
                <li>The kernel gateway must be running on the same machine as your browser</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KernelSetup;
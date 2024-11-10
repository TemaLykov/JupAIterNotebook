import React, { useState } from 'react';
import { MessageSquare, Download, Settings, Sun, Moon } from 'lucide-react';
import OpenAI from 'openai';
import ChatInterface from './components/ChatInterface';
import NotebookEditor from './components/NotebookEditor';
import SettingsModal from './components/SettingsModal';
import ResizablePane from './components/ResizablePane';
import { Cell, Message, Settings as SettingsType } from './types';
import { createLangchainService } from './services/LangchainService';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [attachedCell, setAttachedCell] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [settings, setSettings] = useState<SettingsType>({
    openaiKey: '',
    model: 'gpt-4o',
    pythonEnv: '',
  });

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);

    try {
      if (!settings.openaiKey) {
        throw new Error('OpenAI API key not set. Please configure it in settings.');
      }

      const langchain = createLangchainService(settings.openaiKey);
      
      const editDecision = await langchain.analyzeEditIntent(
        content,
        cells
      );

      let response;
      if (editDecision.editType === 'single' && attachedCell) {
        const targetCell = cells.find(cell => cell.id === attachedCell);
        if (!targetCell) {
          throw new Error('Attached cell not found');
        }

        response = await langchain.generateNotebookUpdate(
          content,
          cells,
          targetCell
        );

        setCells(prev => prev.map(cell => 
          cell.id === attachedCell
            ? { ...cell, ...response.cell }
            : cell
        ));

      } else {
        response = await langchain.generateNotebookUpdate(content, cells);
        
        const newCells: Cell[] = response.cells.map((notebookCell: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: notebookCell.type,
          content: notebookCell.content,
          outputs: [],
          status: 'idle',
        }));

        setCells(newCells);
      }

      const aiResponse: Message = {
        role: 'assistant',
        content: response.chat_answer,
        notebook: response.cells,
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Error processing LLM response:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${errorMessage}. Please try again or rephrase your request.`,
        },
      ]);
    }
  };

  const handleDownloadNotebook = () => {
    const notebook = {
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3',
        },
        language_info: {
          name: 'python',
          version: '3.8',
          mimetype: 'text/x-python',
          codemirror_mode: {
            name: 'ipython',
            version: 3,
          },
        },
      },
      nbformat: 4,
      nbformat_minor: 5,
      cells: cells.map(cell => ({
        cell_type: cell.type,
        metadata: {},
        source: [cell.content],
        outputs: cell.outputs.map(output => ({
          output_type: output.output_type,
          text: output.text,
          data: output.data,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notebook.ipynb';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-green-400">
  Jup
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
    AI
  </span>
  ter Notebook
</span>

          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleDownloadNotebook}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Notebook
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <ResizablePane
            leftPane={
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                attachedCell={attachedCell}
                cells={cells}
              />
            }
            rightPane={
              <NotebookEditor
                cells={cells}
                setCells={setCells}
                activeCell={activeCell}
                setActiveCell={setActiveCell}
                attachedCell={attachedCell}
                setAttachedCell={setAttachedCell}
                pythonEnv={settings.pythonEnv}
              />
            }
            initialLeftWidth={30}
          />
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={setSettings}
        />
      </div>
    </div>
  );
}

export default App;
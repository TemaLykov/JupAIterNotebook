import React, { useState, useRef, useEffect } from 'react';
import { Send, Link } from 'lucide-react';
import { Message, Cell } from '../types';
import MarkdownPreview from './MarkdownPreview';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  attachedCell: string | null;
  cells: Cell[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  attachedCell,
  cells 
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsGenerating(true);
      await onSendMessage(input);
      setIsGenerating(false);
      setInput('');
    }
  };

  const getAttachedCellInfo = () => {
    if (!attachedCell) return null;
    const cell = cells.find(c => c.id === attachedCell);
    if (!cell) return null;
    const index = cells.findIndex(c => c.id === attachedCell);
    return { cell, index };
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {message.role === 'assistant' && message.notebook ? (
                <div className="space-y-3">
                  <MarkdownPreview content={message.content} />
                  <div className="text-sm text-gray-400 mt-2">
                    {message.notebook.length} cell{message.notebook.length !== 1 ? 's' : ''} generated
                  </div>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                Generating response...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-700 p-4 bg-gray-800"
      >
        {attachedCell && (
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
            <Link className="w-4 h-4" />
            {getAttachedCellInfo() && (
              <span>Editing Cell [{getAttachedCellInfo()!.index + 1}]</span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              attachedCell
                ? "Edit the attached cell..."
                : "Ask me to create or modify the notebook..."
            }
            className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
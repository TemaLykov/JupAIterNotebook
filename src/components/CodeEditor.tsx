import React from 'react';
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'python' | 'markdown';
  onExecute?: () => void;
}

function CodeEditor({ value, onChange, language, onExecute }: CodeEditorProps) {
  const handleEditorDidMount = (editor: any) => {
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onExecute?.();
    });
  };

  return (
    <Editor
      height="auto"
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'off',
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        wrappingStrategy: 'advanced',
        padding: { top: 8, bottom: 8 },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
      }}
      theme="vs-dark"
    />
  );
}

export default CodeEditor;
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  setCode: (value: string) => void;
  language: string;
}

export default function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || '')}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 }
      }}
    />
  );
}

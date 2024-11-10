export type CellType = 'code' | 'markdown';
export type CellStatus = 'idle' | 'running' | 'success' | 'error';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  notebook?: NotebookCell[];
}

export interface NotebookCell {
  cell_type: CellType;
  metadata: {
    trusted: boolean;
    execution?: {
      count: number | null;
      status: CellStatus;
    };
  };
  source: string[];
  outputs: CellOutput[];
}

export interface CellOutput {
  output_type: 'stream' | 'error' | 'execute_result' | 'display_data';
  text?: string[];
  data?: {
    'text/plain'?: string[];
    'text/html'?: string[];
    'image/png'?: string;
  };
  execution_count?: number;
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  outputs: Output[];
  status: CellStatus;
}

export interface Output {
  output_type: 'success' | 'error' | 'stream';
  content: string;
  execution_count?: number;
}

export interface Settings {
  openaiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  pythonEnv: string;
}

export interface KernelMessage {
  header: {
    msg_type: string;
  };
  content: any;
  parent_header: {
    msg_id?: string;
  };
}
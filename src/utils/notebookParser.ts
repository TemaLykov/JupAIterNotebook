import { Message, NotebookCell } from '../types';

interface LLMResponse {
  chat_answer: string;
  cells: Array<{
    type: 'code' | 'markdown';
    content: string;
  }>;
}

export function parseLLMResponse(response: string): LLMResponse {
  try {
    const parsed = JSON.parse(response);

    // Validate required fields
    if (!parsed.chat_answer || typeof parsed.chat_answer !== 'string') {
      throw new Error('Invalid response: missing or invalid chat_answer');
    }

    if (!Array.isArray(parsed.cells)) {
      throw new Error('Invalid response: cells must be an array');
    }

    // Validate each cell
    parsed.cells.forEach((cell: any, index: number) => {
      if (!cell.type || !['code', 'markdown'].includes(cell.type)) {
        throw new Error(`Invalid cell type at index ${index}`);
      }
      if (typeof cell.content !== 'string') {
        throw new Error(`Invalid cell content at index ${index}`);
      }
    });

    return parsed as LLMResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response from OpenAI');
    }
    throw error;
  }
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
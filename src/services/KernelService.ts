import { KernelMessage } from '../types';

export class KernelService {
  private baseUrl: string;
  private kernelId: string | null = null;
  private ws: WebSocket | null = null;
  private messageCallbacks: Map<string, (msg: KernelMessage) => void> = new Map();
  private connectionRetries: number = 0;
  private maxRetries: number = 3;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async connect(): Promise<void> {
    try {
      // Get or create kernel
      const kernelResponse = await fetch(`${this.baseUrl}/api/kernels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!kernelResponse.ok) {
        throw new Error('Failed to create kernel');
      }

      const kernel = await kernelResponse.json();
      this.kernelId = kernel.id;

      await this.establishWebSocket();

    } catch (error) {
      console.error('Kernel connection error:', error);
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`Retrying connection (${this.connectionRetries}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.connect();
      }
      throw new Error('Failed to connect to kernel after multiple attempts');
    }
  }

  private async establishWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl.replace('http', 'ws')}/api/kernels/${this.kernelId}/channels`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.connectionRetries = 0;
        resolve();
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (this.connectionRetries < this.maxRetries) {
          this.connectionRetries++;
          console.log(`Attempting to reconnect (${this.connectionRetries}/${this.maxRetries})...`);
          setTimeout(() => this.establishWebSocket(), 1000);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: KernelMessage = JSON.parse(event.data);
          const parentId = msg.parent_header?.msg_id;
          if (parentId) {
            const callback = this.messageCallbacks.get(parentId);
            if (callback) {
              callback(msg);
            }
          }
        } catch (error) {
          console.error('Error processing kernel message:', error);
        }
      };
    });
  }

  async executeCode(code: string, onOutput: (output: any) => void): Promise<void> {
    if (!this.ws || !this.kernelId) {
      throw new Error('Kernel not connected');
    }

    const msgId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      let executionCount: number | null = null;
      let error: Error | null = null;
      let isComplete = false;
      let timeout: NodeJS.Timeout;

      const cleanup = () => {
        this.messageCallbacks.delete(msgId);
        clearTimeout(timeout);
      };

      // Set timeout for execution
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Code execution timed out'));
      }, 30000);

      const handleMessage = (msg: KernelMessage) => {
        switch (msg.header.msg_type) {
          case 'execute_input':
            executionCount = msg.content.execution_count;
            break;

          case 'stream':
            onOutput({
              output_type: 'stream',
              text: [msg.content.text],
              execution_count: executionCount,
            });
            break;

          case 'execute_result':
          case 'display_data':
            onOutput({
              output_type: msg.header.msg_type,
              data: msg.content.data,
              execution_count: msg.content.execution_count,
            });
            break;

          case 'error':
            error = new Error(msg.content.traceback.join('\n'));
            onOutput({
              output_type: 'error',
              ename: msg.content.ename,
              evalue: msg.content.evalue,
              traceback: msg.content.traceback,
            });
            break;

          case 'status':
            if (msg.content.execution_state === 'idle' && !isComplete) {
              isComplete = true;
              cleanup();
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            }
            break;
        }
      };

      this.messageCallbacks.set(msgId, handleMessage);

      const executeRequest = {
        header: {
          msg_id: msgId,
          msg_type: 'execute_request',
          username: 'user',
          session: crypto.randomUUID(),
          date: new Date().toISOString(),
          version: '5.3',
        },
        content: {
          code,
          silent: false,
          store_history: true,
          user_expressions: {},
          allow_stdin: false,
        },
        metadata: {},
        parent_header: {},
      };

      this.ws.send(JSON.stringify(executeRequest));
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.kernelId = null;
    this.messageCallbacks.clear();
    this.connectionRetries = 0;
  }
}

export const createKernelService = (baseUrl: string): KernelService => {
  return new KernelService(baseUrl);
};
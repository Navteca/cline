/**
 * Example showing how to extract and reuse core Cline functionality
 * 
 * This demonstrates the approach to making Cline's core logic 
 * host-agnostic so it can work in both VS Code and JupyterLab.
 */

// This would be extracted from the main Cline codebase
// Example: src/core/controller/Controller.ts adaptation

export interface HostProvider {
  // File system operations
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listFiles(directory: string): Promise<string[]>;
  
  // UI operations  
  showMessage(message: string, type: 'info' | 'warning' | 'error'): Promise<void>;
  showProgress(title: string, task: () => Promise<void>): Promise<void>;
  
  // Terminal operations
  executeCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  
  // Context operations
  getCurrentWorkspace(): Promise<string>;
  getActiveDocument(): Promise<{ path: string; content: string; language: string } | null>;
}

/**
 * JupyterLab implementation of the HostProvider interface
 */
export class JupyterLabHostProvider implements HostProvider {
  private jupyterLabAPI: any;

  constructor(jupyterLabAPI: any) {
    this.jupyterLabAPI = jupyterLabAPI;
  }

  async readFile(path: string): Promise<string> {
    try {
      const response = await this.jupyterLabAPI.serviceManager.contents.get(path);
      return response.content;
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await this.jupyterLabAPI.serviceManager.contents.save(path, {
        type: 'file',
        format: 'text',
        content: content
      });
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      const response = await this.jupyterLabAPI.serviceManager.contents.get(directory);
      return response.content.map((item: any) => item.name);
    } catch (error) {
      throw new Error(`Failed to list files in ${directory}: ${error}`);
    }
  }

  async showMessage(message: string, type: 'info' | 'warning' | 'error'): Promise<void> {
    // Use JupyterLab's notification system
    const notificationManager = this.jupyterLabAPI.commands?.notificationManager;
    if (notificationManager) {
      notificationManager.emit(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  async showProgress(title: string, task: () => Promise<void>): Promise<void> {
    // JupyterLab progress implementation
    console.log(`Starting: ${title}`);
    try {
      await task();
      console.log(`Completed: ${title}`);
    } catch (error) {
      console.error(`Failed: ${title}`, error);
      throw error;
    }
  }

  async executeCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    // This would integrate with JupyterLab's terminal services
    // or kernel execution for notebook-specific commands
    
    console.log(`Executing command: ${command}`);
    
    // Placeholder implementation
    return {
      stdout: `Mock output for: ${command}`,
      stderr: '',
      exitCode: 0
    };
  }

  async getCurrentWorkspace(): Promise<string> {
    // Get the current working directory in JupyterLab
    try {
      const contents = this.jupyterLabAPI.serviceManager.contents;
      return await contents.getDownloadUrl('./');
    } catch (error) {
      return './';
    }
  }

  async getActiveDocument(): Promise<{ path: string; content: string; language: string } | null> {
    // Get the currently active notebook or file
    const currentWidget = this.jupyterLabAPI.shell?.currentWidget;
    
    if (!currentWidget) {
      return null;
    }

    // Handle notebook
    if (currentWidget.content?.model?.type === 'notebook') {
      const notebook = currentWidget.content;
      const cells = notebook.model.cells;
      
      // Combine all cell contents
      let content = '';
      let language = 'python'; // Default for notebooks
      
      for (let i = 0; i < cells.length; i++) {
        const cell = cells.get(i);
        if (cell.type === 'code') {
          content += `# Cell ${i + 1}\n${cell.value.text}\n\n`;
          // Try to detect language from first code cell
          if (language === 'python' && cell.metadata.get('language')) {
            language = cell.metadata.get('language') as string;
          }
        }
      }

      return {
        path: currentWidget.context?.path || 'untitled.ipynb',
        content,
        language
      };
    }

    // Handle regular files
    if (currentWidget.content?.model?.value) {
      const path = currentWidget.context?.path || 'untitled';
      const extension = path.split('.').pop() || '';
      const languageMap: { [key: string]: string } = {
        'py': 'python',
        'js': 'javascript',
        'ts': 'typescript',
        'md': 'markdown',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml'
      };

      return {
        path,
        content: currentWidget.content.model.value.text,
        language: languageMap[extension] || 'text'
      };
    }

    return null;
  }
}

/**
 * Extracted core Cline controller that works with any HostProvider
 * 
 * This is a simplified version showing how the main Cline logic
 * could be made host-agnostic.
 */
export class CoreClineController {
  private hostProvider: HostProvider;
  private config: any;

  constructor(hostProvider: HostProvider, config: any) {
    this.hostProvider = hostProvider;
    this.config = config;
  }

  async analyzeContext(): Promise<string> {
    const workspace = await this.hostProvider.getCurrentWorkspace();
    const activeDoc = await this.hostProvider.getActiveDocument();
    
    let analysis = `Current workspace: ${workspace}\n\n`;
    
    if (activeDoc) {
      analysis += `Active document: ${activeDoc.path}\n`;
      analysis += `Language: ${activeDoc.language}\n`;
      analysis += `Content preview:\n${activeDoc.content.slice(0, 500)}...\n`;
    } else {
      analysis += 'No active document found.\n';
    }

    return analysis;
  }

  async executeTask(task: string): Promise<string> {
    // This would be the main task execution logic from Cline
    // Simplified for demonstration
    
    await this.hostProvider.showMessage(`Starting task: ${task}`, 'info');
    
    const context = await this.analyzeContext();
    
    // In the real implementation, this would:
    // 1. Parse the task
    // 2. Plan the steps
    // 3. Execute tools as needed
    // 4. Generate responses using LLM
    
    return `Task completed: ${task}\n\nContext analysis:\n${context}`;
  }
}

/**
 * Factory function to create a Cline controller for JupyterLab
 */
export function createClineController(jupyterLabAPI: any, config: any): CoreClineController {
  const hostProvider = new JupyterLabHostProvider(jupyterLabAPI);
  return new CoreClineController(hostProvider, config);
}